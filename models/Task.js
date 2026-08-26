const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            maxlength: 100
        },

        description: {
            type: String,
            trim: true
        },

        completed: {
            type: Boolean,
            default: false
        },

        dueDate: {
            type: Date
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Task", taskSchema);