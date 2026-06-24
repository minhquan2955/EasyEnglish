import Enrollment from "../models/Enrollment.js";
import Payment from "../models/Payment.js";
import Student from "../models/Student.js";
import Parent from "../models/Parent.js";

/**
 * @desc    Admin: Lấy danh sách tổng hợp công nợ học phí
 * @route   GET /api/admin/tuition
 * @access  Private (Admin)
 */
export const getTuitionList = async (req, res, next) => {
  try {
    // Get all active enrollments with student + class + course info
    const enrollments = await Enrollment.find({ status: "active" })
      .populate({
        path: "studentId",
        populate: { path: "userId", select: "fullName email phone" },
      })
      .populate({
        path: "classId",
        select: "classCode courseId",
        populate: { path: "courseId", select: "name tuitionFee code" },
      })
      .sort({ createdAt: -1 });

    // Get all payments grouped by studentId + classId
    const payments = await Payment.aggregate([
      {
        $group: {
          _id: { studentId: "$studentId", classId: "$classId" },
          totalPaid: { $sum: "$amount" },
          paymentCount: { $sum: 1 },
          lastPaymentDate: { $max: "$paymentDate" },
        },
      },
    ]);

    // Build a lookup map for payments
    const paymentMap = {};
    payments.forEach((p) => {
      const key = `${p._id.studentId}_${p._id.classId}`;
      paymentMap[key] = p;
    });

    // Combine enrollment + payment data
    const tuitionList = enrollments
      .filter((e) => e.studentId && e.classId?.courseId)
      .map((enrollment) => {
        const key = `${enrollment.studentId._id}_${enrollment.classId._id}`;
        const paymentInfo = paymentMap[key] || {
          totalPaid: 0,
          paymentCount: 0,
          lastPaymentDate: null,
        };
        const tuitionFee = enrollment.classId.courseId.tuitionFee || 0;

        return {
          enrollmentId: enrollment._id,
          student: {
            _id: enrollment.studentId._id,
            studentCode: enrollment.studentId.studentCode,
            fullName: enrollment.studentId.userId?.fullName || "—",
            email: enrollment.studentId.userId?.email || "—",
            phone: enrollment.studentId.userId?.phone || "—",
          },
          class: {
            _id: enrollment.classId._id,
            classCode: enrollment.classId.classCode,
            courseName: enrollment.classId.courseId.name,
            courseCode: enrollment.classId.courseId.code,
          },
          tuitionFee,
          totalPaid: paymentInfo.totalPaid,
          remaining: tuitionFee - paymentInfo.totalPaid,
          paymentCount: paymentInfo.paymentCount,
          lastPaymentDate: paymentInfo.lastPaymentDate,
          status:
            paymentInfo.totalPaid >= tuitionFee
              ? "paid"
              : paymentInfo.totalPaid > 0
                ? "partial"
                : "unpaid",
        };
      });

    res.status(200).json({ tuitionList });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Ghi nhận 1 khoản thanh toán học phí
 * @route   POST /api/admin/tuition/pay
 * @access  Private (Admin)
 */
export const recordPayment = async (req, res, next) => {
  try {
    const { studentId, classId, amount, method, notes, receiptNumber } =
      req.body;

    if (!studentId || !classId || !amount || !method) {
      res.status(400);
      throw new Error(
        "Vui lòng cung cấp đầy đủ: studentId, classId, amount, method",
      );
    }

    if (amount <= 0) {
      res.status(400);
      throw new Error("Số tiền phải lớn hơn 0");
    }

    // Verify enrollment exists
    const enrollment = await Enrollment.findOne({
      studentId,
      classId,
      status: "active",
    });
    if (!enrollment) {
      res.status(404);
      throw new Error("Không tìm thấy ghi danh hợp lệ cho học sinh này");
    }

    const payment = await Payment.create({
      studentId,
      classId,
      amount,
      method,
      notes,
      receiptNumber,
      recordedBy: req.user.userId,
    });

    res
      .status(201)
      .json({ message: "Ghi nhận thanh toán thành công", payment });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Lấy lịch sử thanh toán của 1 enrollment cụ thể
 * @route   GET /api/admin/tuition/history/:studentId/:classId
 * @access  Private (Admin)
 */
export const getPaymentHistory = async (req, res, next) => {
  try {
    const { studentId, classId } = req.params;

    const payments = await Payment.find({ studentId, classId })
      .populate("recordedBy", "fullName")
      .sort({ paymentDate: -1 });

    res.status(200).json({ payments });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Student/Parent: Lấy thông tin học phí của mình (hoặc con mình)
 * @route   GET /api/tuition/my-payments
 * @access  Private (Student, Parent)
 */
export const getMyPayments = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    let studentIds = [];

    if (role === "student") {
      const student = await Student.findOne({ userId });
      if (!student) {
        res.status(404);
        throw new Error("Không tìm thấy hồ sơ học sinh");
      }
      studentIds = [student._id];
    } else if (role === "parent") {
      const parent = await Parent.findOne({ userId });
      if (!parent) {
        res.status(404);
        throw new Error("Không tìm thấy hồ sơ phụ huynh");
      }
      // Get all linked students
      studentIds = parent.studentIds || [];
    } else {
      res.status(403);
      throw new Error("Không có quyền truy cập");
    }

    if (studentIds.length === 0) {
      return res.status(200).json({ tuitionData: [] });
    }

    // Get enrollments for these students
    const enrollments = await Enrollment.find({
      studentId: { $in: studentIds },
      status: "active",
    })
      .populate({
        path: "studentId",
        populate: { path: "userId", select: "fullName" },
      })
      .populate({
        path: "classId",
        select: "classCode courseId",
        populate: { path: "courseId", select: "name tuitionFee code" },
      });

    // Get all payments for these students
    const payments = await Payment.find({
      studentId: { $in: studentIds },
    }).sort({ paymentDate: -1 });

    // Build payment map
    const paymentMap = {};
    payments.forEach((p) => {
      const key = `${p.studentId}_${p.classId}`;
      if (!paymentMap[key]) paymentMap[key] = { totalPaid: 0, history: [] };
      paymentMap[key].totalPaid += p.amount;
      paymentMap[key].history.push({
        amount: p.amount,
        method: p.method,
        paymentDate: p.paymentDate,
        notes: p.notes,
        receiptNumber: p.receiptNumber,
      });
    });

    const tuitionData = enrollments
      .filter((e) => e.studentId && e.classId?.courseId)
      .map((e) => {
        const key = `${e.studentId._id}_${e.classId._id}`;
        const pInfo = paymentMap[key] || { totalPaid: 0, history: [] };
        const fee = e.classId.courseId.tuitionFee || 0;

        return {
          studentName: e.studentId.userId?.fullName || "—",
          studentCode: e.studentId.studentCode,
          classCode: e.classId.classCode,
          courseName: e.classId.courseId.name,
          tuitionFee: fee,
          totalPaid: pInfo.totalPaid,
          remaining: fee - pInfo.totalPaid,
          status:
            pInfo.totalPaid >= fee
              ? "paid"
              : pInfo.totalPaid > 0
                ? "partial"
                : "unpaid",
          history: pInfo.history,
        };
      });

    res.status(200).json({ tuitionData });
  } catch (error) {
    next(error);
  }
};
