import Message from "../models/Message.model.js";

export default class MessageRepository {
    static async create(data) {
        return await Message.create(data);
    }

    static async findAll() {
        return await Message.find().populate("sender").populate("receiver");
    }

    static async findById(id) {
        return await Message.findById(id).populate("sender").populate("receiver");
    }

    static async update(id, data) {
        return await Message.findByIdAndUpdate(id, data, { new: true });
    }

    static async delete(id) {
        return await Message.findByIdAndDelete(id);
    }
}