import mongoose, { Schema } from "mongoose";
import crypto from "crypto";

interface ITag extends mongoose.Document {
  title: string;
}

interface ILink extends mongoose.Document {
  hash: string;
  userId: mongoose.Types.ObjectId;
  generateHash(): Promise<void>;
}

const tagSchema = new Schema<ITag>(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const linkSchema = new Schema<ILink>(
  {
    hash: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

linkSchema.methods.generateHash = async function () {
  if (!this._id) {
    throw new Error("Document must have an _id to generate a hash.");
  }

  const inputString = this._id.toString();
  const hash = crypto.createHash("md5").update(inputString).digest("hex");
  this.hash = hash.substring(0, 8);
};

linkSchema.pre("save", async function (next) {
  if (this.isNew && !this.hash) {
    await this.generateHash();
  }
  next();
});

export const Tag = mongoose.model<ITag>("Tag", tagSchema);
export const Link = mongoose.model<ILink>("Link", linkSchema);
