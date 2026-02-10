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
import type { WelcomeProps } from "@/types/email";

export default function Welcome({ userName, setupTopicsUrl }: WelcomeProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to DailyBrief - Get started with your personalized news</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>DailyBrief</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={heading}>Welcome to DailyBrief, {userName}!</Heading>
            <Text style={text}>
              We&apos;re excited to help you stay informed with personalized daily briefings
              tailored to your interests.
            </Text>

            {/* Quick Start Guide */}
            <Section style={guideSection}>
              <Heading style={guideHeading}>Get Started in 3 Easy Steps</Heading>

              <div style={step}>
                <div style={stepNumber}>1</div>
                <div style={stepContent}>
                  <Heading style={stepTitle}>Choose Your Topics</Heading>
                  <Text style={stepText}>
                    Browse our curated topics or chat with our AI to discover what interests
                    you. From technology and sports to global events and culture.
                  </Text>
                </div>
              </div>

              <div style={step}>
                <div style={stepNumber}>2</div>
                <div style={stepContent}>
                  <Heading style={stepTitle}>Customize Your Brief</Heading>
                  <Text style={stepText}>
                    Set your delivery time, preferred length, and topic priorities to receive
                    exactly the news you need each morning.
                  </Text>
                </div>
              </div>

              <div style={step}>
                <div style={stepNumber}>3</div>
                <div style={stepContent}>
                  <Heading style={stepTitle}>Receive Daily Insights</Heading>
                  <Text style={stepText}>
                    Wake up to a beautifully formatted email with AI-curated summaries of the
                    most important stories in your areas of interest.
                  </Text>
                </div>
              </div>
            </Section>

            <Button style={button} href={setupTopicsUrl}>
              Set Up Your Topics
            </Button>

            {/* What to Expect */}
            <Section style={expectSection}>
              <Heading style={expectHeading}>What to Expect</Heading>
              <Text style={expectText}>
                Your daily brief will arrive each morning at your chosen time, featuring:
              </Text>
              <ul style={expectList}>
                <li style={expectItem}>
                  <strong>AI-Curated Content:</strong> Smart summaries of the most relevant
                  news for your selected topics
                </li>
                <li style={expectItem}>
                  <strong>Multiple Perspectives:</strong> Diverse sources to give you a
                  well-rounded view
                </li>
                <li style={expectItem}>
                  <strong>Global Events:</strong> Important dates and events happening around
                  the world
                </li>
                <li style={expectItem}>
                  <strong>Time-Saving Format:</strong> Scan your brief in under 5 minutes
                </li>
              </ul>
            </Section>

            <Text style={closingText}>
              Ready to transform your morning routine? Let&apos;s get started!
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
  fontSize: "28px",
  fontWeight: "600",
  margin: "0 0 16px",
  textAlign: "center" as const,
};

const text = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 32px",
  textAlign: "center" as const,
};

const guideSection = {
  margin: "0 0 32px",
};

const guideHeading = {
  color: "#1a1a1a",
  fontSize: "20px",
  fontWeight: "600",
  margin: "0 0 24px",
  textAlign: "center" as const,
};

const step = {
  display: "flex",
  gap: "16px",
  marginBottom: "24px",
  alignItems: "flex-start",
};

const stepNumber = {
  backgroundColor: "#4f46e5",
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "700",
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: "0",
};

const stepContent = {
  flex: "1",
};

const stepTitle = {
  color: "#1a1a1a",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 8px",
};

const stepText = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
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
  padding: "14px 32px",
  margin: "0 auto 32px",
};

const expectSection = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "24px",
  margin: "0 0 24px",
};

const expectHeading = {
  color: "#1a1a1a",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 12px",
};

const expectText = {
  color: "#4b5563",
  fontSize: "15px",
  lineHeight: "22px",
  margin: "0 0 16px",
};

const expectList = {
  color: "#4b5563",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
  paddingLeft: "20px",
};

const expectItem = {
  marginBottom: "12px",
};

const closingText = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "24px",
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
