const User = require("../models/User");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const sendEmail = require("../utils/email");
const crypto = require('crypto');

// register
exports.register = asyncHandler(async (req, res, next) => {
    
    const user = await User.create(req.body);

    res.status(200).json({
      success: true,
      user,
      token: user.getJsonWebToken()
    });
  });

  // login
exports.login = asyncHandler(async (req, res, next) => {
    
    const {email, password} = req.body;
    // Оролт шалгах 
    if(!email || !password) throw new MyError('Имэйл хаяг болон нууц үг хоосон байж болохгүй',400);
    
    // Тухайн хэрэглэгчийн хайна +password select хийхэд нэмээд өгөөрэй гэсэн утгатай
    const user = await User.findOne({email}).select('+password'); 
    if(!user){
        throw new MyError('Имэйл болон нууц үгээ зөв оруулна уу',401);
    }

    const _isLogin = await user.checkPassword(password);
    if(!_isLogin){
        throw new MyError('Имэйл болон нууц үгээ зөв оруулна уу',401);
    }

    const token = user.getJsonWebToken();

    const cookieOption = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      httpOnly: true
    }

    res.status(200).cookie('amazon-token', token, cookieOption).json({
      success: true,
      user,
      token: token
    });
  });

  exports.logout = asyncHandler(async (req, res, next) => {
    const cookieOption = {
      expires: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      httpOnly: true
    }

    res.status(200).cookie('amazon-token', "", cookieOption).json({
      success: true,
      data: "logged out..."
    });
  });


  exports.getUsers = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort;
    const select = req.query.select;
  
    ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
  
    const pagination = await paginate(page, limit, User);
  
    const users = await User.find(req.query, select)
      .sort(sort)
      .skip(pagination.start - 1)
      .limit(limit);
  
    res.status(200).json({
      success: true,
      data: users,
      pagination,
    });
  });
  
  exports.getUser = asyncHandler(async (req, res, next) => {
      //.populate("books")
    
    const user = await User.findById(req.params.id);
  
    if (!user) {
      throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
    }
  
    res.status(200).json({
      success: true,
      data: user,
    });
  });
  
  exports.createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body);
  
    res.status(200).json({
      success: true,
      data: user,
    });
  });
  
  exports.updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
  
    if (!user) {
      throw new MyError(req.params.id + " ID-тэй Хэрэглэгч байхгүйээээ.", 400);
    }
    res.status(200).json({
        success: true,
        data: user,
      });
    });
    
    exports.deleteUser = asyncHandler(async (req, res, next) => {
      const  user = await User.findById(req.params.id);
    
      if (!user) {
        throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
      }
    
      user.remove();
    
      res.status(200).json({
        success: true,
        data: user,
      });
    });


    exports.forgotPassword = asyncHandler(async (req, res, next) => {
        if(!req.body.email){
            throw new MyError(" Имэйл хаягаа дамжуулна уу.", 400);
        }

        const user = await User.findOne({email: req.body.email});
        
        if(!user){
            throw new MyError( req.body.email + " Имэйлтэй хэрэглэгч байхгүй байна.", 400);
        }

        const resetToken = user.generatePasswordChangeToken();
        await user.save()
        // await user.save({ validateBeforeSave: false });

        const link = `https://amazon.mn/changepassword/${resetToken}`;
        const message = `Сайн байна уу? Доод линк дээр дарж солино уу <br> <br> <a href="${link}" target=_blank>${link}</a><br> <br> өдрийг сайхан өнгөрүүлээрэй!`;

        // Имэйл илгээнэ 
        const info = await sendEmail({
          email: user.email,
          subject: 'Нууц үг сэргээх хүсэлт',
          message

        })

        console.log("Message sent: %s", info.messageId);

        res.status(200).json({
          success: true,
          resetToken,
          message
        });

      });


      exports.resetPassword = asyncHandler(async (req, res, next) => {
        if(!req.body.resetToken || !req.body.password){
            throw new MyError("Токен болон нууц үгээ дамжуулна уу.", 400);
        }

        const encryptd = crypto
                        .createHash('sha256')
                        .update(req.body.resetToken)
                        .digest('hex');
      

        const user = await User.findOne({
          resetPasswordToken: encryptd, 
          resetPasswordExpire: {$gt: Date.now()}
        });
        
        if(!user){
            throw new MyError( req.body.email + "Токен хүчингүй байна.", 400);
        }

        user.password = req.body.password;
        user.resetPassword = undefined;
        user.resetPasswordExpire = undefined;

        await user.save()
        
        const token = user.getJsonWebToken();
        res.status(200).json({
          success:true,
          token,
          user
        })

      });