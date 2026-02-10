import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { MagicLinkProps } from "@/types/email";

export default function MagicLink({ magicLink }: MagicLinkProps) {
  return (
    <Html>
      <Head />
      <Preview>Sign in to DailyBrief</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>DailyBrief</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={heading}>Sign in to DailyBrief</Heading>
            <Text style={text}>
              Click the button below to securely sign in to your DailyBrief account.
            </Text>

            <Button style={button} href={magicLink}>
              Sign In
            </Button>

            <Text style={expiryText}>
              This link expires in 24 hours and can only be used once.
            </Text>

            <Text style={securityText}>
              If you didn&apos;t request this email, you can safely ignore it.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Powered by <strong>DailyBrief</strong> — Your personalized news digest
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  padding: "32px 40px 24px",
  borderBottom: "1px solid #e6ebf1",
};

const logo = {
  color: "#1a1a1a",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0",
};

const content = {
  padding: "40px 40px 32px",
};

const heading = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600",
  margin: "0 0 20px",
  textAlign: "center" as const,
};

const text = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 24px",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#4f46e5",
  borderRadius: "8px",
  color: "#ffffff",
  display: "block",
  fontSize: "16px",
  fontWeight: "600",
  textAlign: "center" as const,
  textDecoration: "none",
  padding: "12px 32px",
  margin: "0 auto 24px",
};

const expiryText = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 16px",
  textAlign: "center" as const,
};

const securityText = {
  color: "#9ca3af",
  fontSize: "13px",
  lineHeight: "18px",
  margin: "0",
  textAlign: "center" as const,
};

const footer = {
  padding: "24px 40px 32px",
  borderTop: "1px solid #e6ebf1",
};

const footerText = {
  color: "#9ca3af",
  fontSize: "12px",
  textAlign: "center" as const,
  margin: "0",
};
