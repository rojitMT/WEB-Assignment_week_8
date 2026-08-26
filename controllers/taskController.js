const mongoose = require("mongoose");
const Task = require("../models/Task");

// CREATE
const createTask = async (req, res, next) => {
    try {
        const {
            title,
            description,
            completed,
            dueDate
        } = req.body;

        if (!title || title.trim() === "") {
            return res.status(400).json({
                message: "Title is required"
            });
        }

        const task = await Task.create({
            title,
            description,
            completed,
            dueDate,
            user: req.userId
        });

        res.status(201).json(task);

    } catch (error) {
        next(error);
    }
};


// READ ALL
const getTasks = async (req, res, next) => {
    try {
        const { completed } = req.query;

        const filter = {
            user: req.userId
        };

        if (completed !== undefined) {
            if (completed !== "true" && completed !== "false") {
                return res.status(400).json({
                    message: "Completed filter must be true or false"
                });
            }

            filter.completed = completed === "true";
        }

        const tasks = await Task.find(filter)
            .sort({ createdAt: -1 });

        res.status(200).json(tasks);

    } catch (error) {
        next(error);
    }
};


// READ ONE
const getTaskById = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid task ID"
            });
        }

        const task = await Task.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.status(200).json(task);

    } catch (error) {
        next(error);
    }
};


// UPDATE
const updateTask = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid task ID"
            });
        }

        const {
            title,
            description,
            completed,
            dueDate
        } = req.body;

        if (
            title !== undefined &&
            (!title || title.trim() === "")
        ) {
            return res.status(400).json({
                message: "Title cannot be empty"
            });
        }

        const updates = {};

        if (title !== undefined) updates.title = title;
        if (description !== undefined) {
            updates.description = description;
        }
        if (completed !== undefined) {
            updates.completed = completed;
        }
        if (dueDate !== undefined) {
            updates.dueDate = dueDate;
        }

        const task = await Task.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.userId
            },
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.status(200).json(task);

    } catch (error) {
        next(error);
    }
};


// DELETE
const deleteTask = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid task ID"
            });
        }

        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.status(200).json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
};