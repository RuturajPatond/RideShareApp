
const catchAsync = require('../utils/catchAsync');
const AppError = require("../utils/appError");
const user = require('../db/models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JSON_SECRET_KEY, {
        expiresIn: process.env.JSON_EXPIRY
    });
}
const login = async (req, res, next) => {
    const {email, password} = req.body;
    
    if (!email || !password) {
        return next(new AppError("Incorrect Email or Password", 400));
    }
    const result = await user.findOne({where: {email}});
    if (!result || !(await bcrypt.compare(password, result.password))) {
        return next(new AppError("Incorrect Email or Password", 400));
    }
    const token = generateToken({id: result.id});

    return res.status(201).json({
        status: "success",
        message: "Login Successfully",
        token,
        user : {
            id : result.id,
            firstName: result.firstName,
            lastName : result.lastName,
            email : result.email,
            userType : result.userType
        }
    })
}
const signup = catchAsync(async (req, res, next) => {
    const body = req.body;
    if (!["1", "2"].includes(body.userType)) {
        throw new AppError("Invalid user Type", 400);
    };
    const newUser = await user.create({
        userType: body.userType,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        password: body.password,
        confirmPassword: body.confirmPassword,
    });
    if (!newUser) {
        return next(new AppError("Failed to create the user", 400));
    }
    const result = newUser.toJSON();


    result.token = generateToken({
        id: result.id
    })
    delete result.password;
    delete result.deletedAt;
    delete result.confirmPassword;


    return res.status(201).json({
        status: 'success',
        data: result,
    });
    // res.status(200).json({
        //     status: "success",
        //     message: "sighup route are working",
        // })
})

const authentication = catchAsync(async (req, res, next) => {
    let idToken = '';
    // 1. get token from headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        idToken = req.header.authentication.split(" ")[1];
    }
    if (!idToken) {
        return next(new AppError("You need to login first!", 401));
    }

    // 2. token verification
    const tokenDetail = jwt.verify(idToken, process.env.JSON_SECRET_KEY);
    // 3. get the user detail from db and add to req object
    const freshUser = await user.findByPk(tokenDetail.id);

    if (!freshUser) {
        return next(new AppError('User not found!', 401));
    }
    req.user = freshUser;
    return next();
})

const restrictTo = (...userType) => {
    const checkPermission = (req, res, next) => {
        if (!userType.includes(req.user.userType)) {
            return next(
                new AppError(
                    "You don't have permission to perform this action",
                    403
                )
            );
        }
        return next();
    };
    return checkPermission;
};

module.exports = {signup, login, restrictTo, authentication};