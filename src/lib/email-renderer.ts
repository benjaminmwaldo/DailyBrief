import { render } from "@react-email/render";
import DailyBrief from "@/components/emails/daily-brief";
import MagicLink from "@/components/emails/magic-link";
import Welcome from "@/components/emails/welcome";
import type {
  DailyBriefProps,
  MagicLinkProps,
  WelcomeProps,
} from "@/types/email";

interface EmailOutput {
  html: string;
  text: string;
  subject: string;
}

export async function renderDailyBrief(
  props: DailyBriefProps
): Promise<EmailOutput> {
  const html = await render(DailyBrief(props));
  const text = await render(DailyBrief(props), { plainText: true });

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date(props.date));

  const subject = `Your Daily Brief — ${formattedDate}`;

  return { html, text, subject };
}

export async function renderMagicLink(
  props: MagicLinkProps
): Promise<EmailOutput> {
  const html = await render(MagicLink(props));
  const text = await render(MagicLink(props), { plainText: true });

  const subject = "Sign in to DailyBrief";

  return { html, text, subject };
}

export async function renderWelcome(props: WelcomeProps): Promise<EmailOutput> {
  const html = await render(Welcome(props));
  const text = await render(Welcome(props), { plainText: true });

  const subject = `Welcome to DailyBrief, ${props.userName}!`;

  return { html, text, subject };
}
