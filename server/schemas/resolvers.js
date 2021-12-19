const { User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            // Check if context contains a user object
            if(context.user) {
                // search for user and return data
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__v -password')
                    .populate('savedBooks');

                return userData;
            }
            
            // Throw error if user is not logged in
            throw new AuthenticationError('Not logged in!');
        }
    },

    Mutation: {
        login: async (parent, { email, password }) => {
            // Find user by emal and return result
            const user = await User.findOne({ email });

            // Check if a user was found and returned
            if (!user) {
                // No user found, throw an error
                throw new AuthenticationError('Incorrect credentials');
            }

            const validPW = await user.isCorrectPassword(password);

            // Check to determine if password was correct
            if (!validPW) {
                // Password incorrect
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user);
            return { token, user };
        },

        createUser: async (parent, args) => {
            // Create new user width args object
            const user = await User.create(args);

            // Sign a new token for newly created user
            const token = signToken(user);

            // Return both the valid token and new user object
            return { token, user };
        },

        saveBook: async (parent, args, context) => {
            // Check if the context contains a user object
            if (context.user) {
                // Push new books to users savedBooks array
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id},
                    { $push: { savedBooks: args.input }},
                    { new: true }
                );

                // Return updatedUser
                return updatedUser;
            }

            // Throw error if user is not logged in
            throw new AuthenticationError('Not logged in!');
        },

        removeBook: async (parent, { bookId }, context) => {
            // Check if the context contains a user object
            if (context.user) {
                // Pull new book from users savedBooks array
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: bookId } }},
                    { new: true }
                );

                return updatedUser;
            }

            // Throw an error if user is not logged in
            throw new AuthenticationError('Not logged in!');
        }
    }
};

module.exports = resolvers;