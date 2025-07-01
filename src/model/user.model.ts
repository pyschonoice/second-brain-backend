import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt, { Secret, SignOptions } from "jsonwebtoken";

interface IUser extends mongoose.Document {
  username: string;
  password: string;
  isPasswordValid(passwordToCompare: string): Promise<boolean>;
  generateAccessToken(): string;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.generateAccessToken = function (): string {
  const accessTokenSecret = process.env.JWT_ACCESS_KEY!;

  const secret: Secret = accessTokenSecret;
  const tokenExpiry =process.env.JWT_ACCESS_EXPIRY! 
  const signOptions: SignOptions = {
    expiresIn: tokenExpiry as SignOptions['expiresIn'], //asset to the exact type that the expiresIn property expects within the SignOptions interface
  };

  return jwt.sign(
    {
      _id: this._id.toString(),
    },
    secret,
    signOptions
  );
};

userSchema.methods.isPasswordValid = async function (
  passwordToCompare: string
): Promise<boolean> {
  return await bcrypt.compare(passwordToCompare, this.password);
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
