import Refs from "./refs";

type MessageModelRefs = Refs.DialogueMessage | Refs.GroupMessage;

interface MessageFile {
  file: File;
  comment: string;
}

interface Voice extends MessageFile {}

interface Audio extends MessageFile {}

interface Photo extends MessageFile {}

type MessageContentType = string | Voice | Audio | Photo;
type ReceiverType = "user" | "group";

export type {
  MessageModelRefs,
  MessageContentType,
  ReceiverType,
  Voice,
  Audio,
  Photo,
};
