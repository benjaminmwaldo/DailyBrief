import { Resend } from "resend";
import { renderDailyBrief, renderWelcome } from "./email-renderer";
import { prisma } from "./prisma";
import type { DailyBriefProps } from "@/types/email";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not defined");
}

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = process.env.EMAIL_FROM || "briefs@dailybrief.app";

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(params: SendEmailParams): Promise<{ id: string }> {
  const { to, subject, html, text } = params;

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      text,
    });

    if (!result.data?.id) {
      throw new Error("No email ID returned from Resend");
    }

    return { id: result.data.id };
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

export interface BriefData {
  userId: string;
  briefId: string;
  briefProps: DailyBriefProps;
}

export async function sendDailyBrief(briefData: BriefData): Promise<void> {
  const { userId, briefId, briefProps } = briefData;

  // Get user email
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user?.email) {
    throw new Error(`User ${userId} not found or has no email`);
  }

  // Render the email
  const { html, text, subject } = await renderDailyBrief(briefProps);

  // Send the email
  const { id: emailId } = await sendEmail({
    to: user.email,
    subject,
    html,
    text,
  });

  // Update brief status
  await prisma.brief.update({
    where: { id: briefId },
    data: {
      status: "SENT",
      sentAt: new Date(),
    },
  });

  console.log(`Daily brief sent to ${user.email} (email ID: ${emailId})`);
}

export async function sendWelcomeEmail(
  userId: string,
  setupTopicsUrl: string
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user?.email) {
    throw new Error(`User ${userId} not found or has no email`);
  }

  const userName = user.name || "there";

  const { html, text, subject } = await renderWelcome({
    userName,
    setupTopicsUrl,
  });

  await sendEmail({
    to: user.email,
    subject,
    html,
    text,
  });

  console.log(`Welcome email sent to ${user.email}`);
}
