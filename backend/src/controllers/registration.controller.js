import Registration from "../models/Registration.js";

/**
 * @desc    Phụ huynh gửi form đăng ký tư vấn
 * @route   POST /api/registrations
 * @access  Public (không cần đăng nhập)
 */
export const createRegistration = async (req, res, next) => {
  try {
    const { parentName, phone, email, childName, childAge, notes } = req.body;

    const registration = await Registration.create({
      parentName,
      phone,
      email,
      childName,
      childAge,
      notes,
    });

    res.status(201).json({
      message: "Đăng ký tư vấn thành công! Chúng tôi sẽ liên hệ sớm nhất.",
      _id: registration._id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin xem danh sách đăng ký tư vấn
 * @route   GET /api/registrations?status=pending
 * @access  Private (Admin only)
 */
export const getRegistrations = async (req, res, next) => {
  try {
    const { status } = req.query;

    // Lọc theo status nếu có, không thì lấy tất cả
    const filter = status ? { status } : {};

    const registrations = await Registration.find(filter).sort({
      createdAt: -1,
    });

    res.json(registrations);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin cập nhật trạng thái đăng ký
 * @route   PUT /api/registrations/:id
 * @access  Private (Admin only)
 */
export const updateRegistration = async (req, res, next) => {
  try {
    const { status } = req.body;

    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }, // Trả về document đã cập nhật
    );

    if (!registration) {
      res.status(404);
      throw new Error("Không tìm thấy đăng ký tư vấn");
    }

    res.status(200).json(registration);
  } catch (error) {
    next(error);
  }
};
