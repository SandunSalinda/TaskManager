    // src/app/api/tasks/route.ts
    import { NextResponse } from "next/server";
    import dbConnect from "../../lib/dbConnect"; // Adjust path if your lib folder is elsewhere
    import Task from "../../models/Task"; // Adjust path if your models folder is elsewhere
    import mongoose from "mongoose";

    // GET all tasks
    export async function GET() { // _request is unused, but required by Next.js function signature
        try {
            await dbConnect(); // Connect to the database
            const tasks = await Task.find({}); // Find all tasks
            return NextResponse.json({ success: true, data: tasks }, { status: 200 });
        } catch (error: unknown) { // Use unknown for caught errors
            console.error("Error fetching tasks:", error);
            return NextResponse.json(
                { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" },
                { status: 500 }
            );
        }
    }

    // POST a new task
    export async function POST(request: Request) {
        try {
            await dbConnect(); // Connect to the database
            const body = await request.json(); // Parse the request body
            const { title, description, dueDate, status } = body; // Include status

            // Basic validation
            if (!title || !description || !dueDate) {
                return NextResponse.json({ success: false, error: "Title, description, and due date are required" }, { status: 400 });
            }

            // Create a new task instance
            const newTask = new Task({
                title,
                description,
                dueDate: new Date(dueDate), // Ensure dueDate is a Date object
                status: status || 'pending', // Default to 'pending' if not provided
            });

            await newTask.save(); // Save the new task to the database
            return NextResponse.json({ success: true, data: newTask }, { status: 201 });
        } catch (error: unknown) {
            console.error("Error creating task:", error);
            // Handle Mongoose validation errors specifically
            if (error instanceof Error && 'name' in error && error.name === 'ValidationError') {
                const mongooseError = error as mongoose.Error.ValidationError;
                const messages = Object.values(mongooseError.errors).map((val: mongoose.Error.ValidatorError | mongoose.Error.CastError) => val.message);
                return NextResponse.json({ success: false, error: messages.join(', ') }, { status: 400 });
            }
            return NextResponse.json(
                { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" },
                { status: 500 }
            );
        }
    }
    