const { User } = require('../models')
const { signToken } = require('../utils/auth');
const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
    Query: {
        // QUERY FOR GETTING CURRENTLY LOGGED IN USER
        me: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({_id: context.user._id}).populate('savedBooks')
            }
            throw new AuthenticationError('You need to be logged in')
        },
    },
    Mutation: {
        // SAVING BOOK USING THE CONTEXT OF THE LOGGED IN USER TO KNOW WHO TO SAVE IT TO
        saveBook: async (parent, args, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: args.book } },
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError("You need to be logged in")
        },
        // REMOVING BOOK USING THE CONTEXT OF THE LOGGED IN USER TO KNOW WHO TO REMOVE IT FROM
        removeBook: async (parent, args, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: args.bookId } } },
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError("You need to be logged in");
        },
        // ADDING USER (SIGN UP) AND RETURNING THE TOKEN ALONG WITH THE NEW USER DATA
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user }
        },
        // ALLOW LOGIN USING USERNAME OR EMAIL
        login: async (parent, args) => {
            const user = await User.findOne({
                $or: [{ username: args.username }, {email: args.email}]
            })
            // CHECK THE PASSWORD IS CORRECT
            const correctPw = await user.isCorrectPassword(args.password)

            if (!correctPw) {
                return;
            }

            const token = signToken(user);
            return { token, user }
        }
    }
}

module.exports = resolvers;