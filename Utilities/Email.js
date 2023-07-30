import nodemailer from "nodemailer";

const vSendEmail = async (vOptions) => {
  const vTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: `${process.env.EMAIL_USERNAME}`,
      pass: `${process.env.EMAIL_PASSWORD}`,
    },
  });
  const vEmailOptions = {
    // from: `${process.env.EMAIL_USERNAME}`,
    // to: `${vOptions.vClientEmail}`,
    // subject: `${vOptions.vSubject}`,
    // html: `${vvMessage}`,
    from: `Socket() ${process.env.EMAIL_USERNAME}`,
    to: `${vOptions.vClientEmail}`,
    subject: `${vOptions.vSubject}`,
    html: `${vOptions.vvMessage}`,
  };
  vTransporter.sendMail(vEmailOptions, (err) => {
    if (err) {
      console.log("Error");
    } else {
      console.log("Email Send");
    }
  });
};

export default vSendEmail;
