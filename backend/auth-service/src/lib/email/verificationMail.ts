import { Mail } from "./mail";

const webURL = process.env.CLOUD_URL
  ? `${process.env.CLOUD_URL}/verify?`
  : "http://localhost:3000/verify?";

class VerificationMail extends Mail {
  constructor(recipient: string, link: string) {
    const verificationSubject = `Peer Prep Verification`;
    const verificationContent = `<p>Click <a href="${webURL}email=${recipient}&token=${link}">here</a> to verify your email.</p>`;

    super(recipient, verificationSubject, verificationContent);
  }
}

export { VerificationMail };
