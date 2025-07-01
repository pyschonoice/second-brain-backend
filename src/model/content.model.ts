
import mongoose, { Schema } from "mongoose";


type ContentTypes = "link" | "image" | "video" | "text";
const contentTypesArray: ContentTypes[] = ["link", "image", "video", "text"];

interface IContent extends mongoose.Document {
  link: string;
  typeofContent: ContentTypes;
  title: string;
  tags: mongoose.Types.ObjectId[];
  userId: mongoose.Types.ObjectId;
}

const contentSchema = new Schema<IContent>(
  {
    link: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    typeofContent: {
      type: String,
      enum: contentTypesArray,
      required: true,
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
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


const Content = mongoose.model<IContent>("Content", contentSchema);

export default Content;