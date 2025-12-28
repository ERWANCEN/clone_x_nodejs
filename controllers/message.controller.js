const createError = require('../middlewares/error');
const ModelUser = require('../models/user.model');
const ModelMessage = require('../models/message.model');

// Send a message
const sendingMessage = async (req, res, next) => {
    try {
        // Who is sending it?        
        const senderId = req.auth.id;

        // To who and what?
        const { receiver, content } = req.body;

        // Validation
        if (!content || !receiver) {
            return res.status(400).json({ message: "The content and the receiver are mandatory" });
        }

        // Checking if the receiver exists
        const receiverExists = await ModelUser.exists({ _id: receiver });

        if (!receiverExists) {
            return res.status(404).json({ message: "Receiver not found" });
        }

        // Creating the message
        let newMessage = await ModelMessage.create({
            sender: senderId,
            receiver: receiver,
            content: content
        });

        res.status(201).json(newMessage);
    } catch (error) {
        next(createError(error.status || 500, "Failed to get all users", error.message));
    }
}

// Update a message
const editMessage = async (req, res, next) => {
    try {
        // Get message's id and the new content
        const { id } = req.params;
        const { content } = req.body;
        const currentUserId = req.auth.id;

        // Basic validation
        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }

        // Find the message
        const messageToUpdate = await ModelMessage.findById(id);

        if (!messageToUpdate) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Checking that it is MY message
        if (messageToUpdate.sender.toString() !== currentUserId) {
            return res.status(403).json({ message: "You can only edit your own messages" });
        }

        // Update and save model informations
        messageToUpdate.content = content;
        messageToUpdate.isEdited = true;

        const updatedMessage = await messageToUpdate.save();

        res.status(200).json(updatedMessage);
    } catch (error) {
        next(createError(error.status || 500, "Failed to update message", error.message));
    }
}

// Delete a message
const deleteMessage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const currentUserId = req.auth.id;

        // We are looking for the message
        const messageToDelete = await ModelMessage.findById(id);

        // Basic verification : does the message exist ?
        if (!messageToDelete) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Is it MY message ?
        if (messageToDelete.sender.toString() !== currentUserId) {
            return res.status(403).json({ message: "You can only delete your own messages" });
        }

        // Delete
        await messageToDelete.deleteOne();

        res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        next(createError(error.status || 500, "Failed to delete message", error.message));
    }
}

module.exports = {
    sendingMessage,
    editMessage,
    deleteMessage
}