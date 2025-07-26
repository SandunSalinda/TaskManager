    // src/models/Task.ts
    import mongoose, { Document, Schema } from 'mongoose';

    // Define the interface for a Task document
    export interface ITask extends Document {
      title: string;
      description: string;
      status: 'pending' | 'in-progress' | 'completed';
      dueDate: Date; // Stored as a Date object
      createdAt: Date;
      updatedAt: Date;
    }

    // Define the Mongoose Schema for Task
    const TaskSchema: Schema<ITask> = new Schema({
      title: {
        type: String,
        required: [true, 'Title is required'],
        maxlength: [100, 'Title cannot be more than 100 characters'],
      },
      description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [500, 'Description cannot be more than 500 characters'],
      },
      status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending',
      },
      dueDate: {
        type: Date,
        required: [true, 'Due date is required'],
      },
    }, {
      timestamps: true, // Automatically adds createdAt and updatedAt fields
    });

    // Export the Mongoose Model. If the model already exists, use it; otherwise, create it.
    const Task = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

    export default Task;
    