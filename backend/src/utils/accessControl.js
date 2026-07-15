import mongoose from "mongoose";
import Class from "../models/Class.js";
import Teacher from "../models/Teacher.js";

export const ensureValidObjectId = (id, fieldName, res) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error(`${fieldName} khong hop le`);
  }
};

export const getTeacherProfileForRequest = async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user.userId });
  if (!teacher) {
    res.status(403);
    throw new Error("Tai khoan giao vien chua co ho so giao vien hop le");
  }
  return teacher;
};

export const ensureTeacherOwnsClass = async (req, res, classDocOrId) => {
  if (req.user.role !== "teacher") {
    return null;
  }

  const teacher = await getTeacherProfileForRequest(req, res);
  const classDoc =
    typeof classDocOrId === "string" || classDocOrId instanceof mongoose.Types.ObjectId
      ? await Class.findById(classDocOrId).select("teacherId classCode")
      : classDocOrId;

  if (!classDoc) {
    res.status(404);
    throw new Error("Khong tim thay lop hoc");
  }

  const ownerTeacherId = classDoc.teacherId?._id || classDoc.teacherId;
  if (!ownerTeacherId || ownerTeacherId.toString() !== teacher._id.toString()) {
    res.status(403);
    throw new Error("Ban khong duoc phep truy cap du lieu cua lop giao vien khac");
  }

  return teacher;
};

export const getTeacherClassIdsForRequest = async (req, res) => {
  if (req.user.role !== "teacher") {
    return null;
  }

  const teacher = await getTeacherProfileForRequest(req, res);
  return Class.find({ teacherId: teacher._id }).distinct("_id");
};
