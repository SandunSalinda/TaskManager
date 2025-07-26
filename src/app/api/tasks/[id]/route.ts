// src/app/api/tasks/[id]/route.ts
import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import Task from "../../../../models/Task";
import mongoose from "mongoose";

// Define an interface for the route handler context, including params
interface RouteContext {
    params: {
        id: string;
    };
}

// Helper to handle and log errors consistently
const handleError = (error: unknown, message = "Internal Server Error", status = 500) => {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: message }, { status });
};

// GET a single task by ID
export async function GET(_request: Request, context: RouteContext) { // Corrected context type, _request parameter
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // _request is unused in this specific GET handler, but required by Next.js function signature.
    try {
        await dbConnect();
        const { id } = context.params;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return handleError(null, "Invalid task ID format", 400); // Use handleError
        }

        const task = await Task.findById(id);
        if (!task) {
            return handleError(null, "Task not found", 404);
        }
        return NextResponse.json({ success: true, data: task }, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof mongoose.Error.CastError) {
            return handleError(error, "Invalid Task ID format", 400);
        }
        return handleError(error, "Error fetching task");
    }
}

// PUT (Update) a single task by ID
export async function PUT(request: Request, context: RouteContext) { // Corrected context type
    await dbConnect();
    const { id } = context.params;

    try {
        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return handleError(null, "Invalid task ID format", 400);
        }

        const body = await request.json();
        const { title, description, dueDate, status } = body;

        // Basic validation for required fields
        if (!title || !description || !dueDate) {
            return handleError(null, "Title, description, and due date are required", 400);
        }

        const updatedTask = await Task.findByIdAndUpdate(
            id,
            {
                title,
                description,
                dueDate: new Date(dueDate),
                status: status || 'pending',
            },
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return handleError(null, "Task not found", 404);
        }

        return NextResponse.json({ success: true, data: updatedTask }, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof mongoose.Error.CastError) {
            return handleError(error, "Invalid Task ID format", 400);
        }
        if (error instanceof mongoose.Error.ValidationError) {
            const messages = Object.values(error.errors).map(
                (val: mongoose.Error.ValidatorError | { message?: string }) => val.message
            ).filter(Boolean);
            return handleError(error, messages.join(', '), 400);
        }
        return handleError(error, "Error updating task");
    }
}

// DELETE a single task by ID
export async function DELETE(_request: Request, context: RouteContext) { // Corrected context type, _request parameter
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // _request is unused in this specific DELETE handler, but required by Next.js function signature.
    await dbConnect();
    const { id } = context.params;

    try {
        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return handleError(null, "Invalid task ID format", 400);
        }

        const deletedTask = await Task.findByIdAndDelete(id);

        if (!deletedTask) {
            return handleError(null, "Task not found", 404);
        }

        return NextResponse.json(
            { success: true, message: "Task deleted successfully" },
            { status: 200 }
        );
    } catch (error: unknown) {
        if (error instanceof mongoose.Error.CastError) {
            return handleError(error, "Invalid Task ID format", 400);
        }
        return handleError(error, "Error deleting task");
    }
}
