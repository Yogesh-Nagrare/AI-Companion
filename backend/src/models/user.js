const mongoose = require('mongoose');
const {Schema} = mongoose;
const bcrypt = require('bcrypt')

const userSchema = new Schema({
    firstName:{
        type: String,
        required: true,
        minLength:3,
        maxLength:20
    },
    lastName:{
        type:String,
        minLength:3,
        maxLength:20,
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        trim: true,
        lowercase:true,
        immutable: true,
    },
    googleId: {
        type: String,
        sparse: true,
        unique: true
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    age:{
        type:Number,
        min:6,
        max:80,
    },
    role:{
        type:String,
        enum:['user','admin'],
        default: 'user'
    },
    profilePic: {
        type: String,
        default: ""
    },
    profilePicPublicId: {
        type: String,
        default: ""
    },
    password:{
        type:String,
        required: function() {
            return this.authProvider === 'local';
        }
    },
    fastapiToken: {
    type: String,
    default: null,
    },
},{
    timestamps:true
});

userSchema.pre('save', async function(next) {
    if (this.authProvider === 'google') {
        return;
    }
    
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
});

const User = mongoose.model("user",userSchema);

module.exports = User;