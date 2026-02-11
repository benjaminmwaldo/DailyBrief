import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import type { DailyBriefProps } from "@/types/email";

export default function DailyBrief({
  userName,
  date,
  topics,
  globalEvents,
  unsubscribeUrl,
  manageTopicsUrl,
}: DailyBriefProps) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));

  const topicCount = topics.length;
  const previewText = `Your daily brief covering ${topicCount} topic${topicCount !== 1 ? "s" : ""}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>DailyBrief</Heading>
            <Text style={dateText}>{formattedDate}</Text>
          </Section>

          {/* Greeting */}
          <Section style={greetingSection}>
            <Heading style={greeting}>Good morning, {userName}</Heading>
            <Text style={summary}>
              Here&apos;s what you need to know today across {topicCount} topic{topicCount !== 1 ? "s" : ""}:
            </Text>
          </Section>

          {/* Topics */}
          {topics.map((topic, topicIndex) => (
            <Section key={topicIndex} style={topicSection}>
              <Heading style={topicHeading}>{topic.name}</Heading>

              {/* Synthesized narrative */}
              {topic.synthesizedSummary ? (
                <Text style={narrativeText}>{topic.synthesizedSummary}</Text>
              ) : (
                /* Fallback: show article summaries if no synthesis */
                topic.articles.map((article, articleIndex) => (
                  <Text key={articleIndex} style={narrativeText}>{article.summary}</Text>
                ))
              )}

              {/* Sources */}
              {topic.sources && topic.sources.length > 0 && (
                <Text style={sourcesLine}>
                  {topic.sources.map((source, sourceIndex) => (
                    <span key={sourceIndex}>
                      {sourceIndex > 0 && <span style={sourcesSeparator}>{" \u00b7 "}</span>}
                      <Link href={source.url} style={sourceLink}>
                        {source.name}
                      </Link>
                    </span>
                  ))}
                </Text>
              )}

              {topicIndex < topics.length - 1 && <Hr style={topicDivider} />}
            </Section>
          ))}

          {/* Global Events */}
          {globalEvents && globalEvents.length > 0 && (
            <Section style={globalEventsSection}>
              <Heading style={globalEventsHeading}>
                Today&apos;s Events
              </Heading>
              {globalEvents.map((event, index) => (
                <div key={index} style={eventContainer}>
                  <Heading style={eventTitle}>{event.title}</Heading>
                  <Text style={eventDescription}>{event.description}</Text>
                  <Text style={eventCategory}>{event.category}</Text>
                </div>
              ))}
            </Section>
          )}

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <Link href={manageTopicsUrl} style={footerLink}>
                Manage your topics
              </Link>
              {" \u2022 "}
              <Link href={unsubscribeUrl} style={footerLink}>
                Unsubscribe
              </Link>
            </Text>
            <Text style={brandingText}>
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
  padding: "32px 40px",
  borderBottom: "1px solid #e6ebf1",
};

const logo = {
  color: "#1a1a1a",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0 0 8px",
};

const dateText = {
  color: "#6b7280",
  fontSize: "14px",
  margin: "0",
};

const greetingSection = {
  padding: "32px 40px 24px",
};

const greeting = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600",
  margin: "0 0 12px",
};

const summary = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0",
};

const topicSection = {
  padding: "0 40px",
  marginBottom: "16px",
};

const topicHeading = {
  color: "#1a1a1a",
  fontSize: "20px",
  fontWeight: "600",
  margin: "0 0 16px",
};

const narrativeText = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const sourcesLine = {
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0 0 4px",
  color: "#9ca3af",
};

const sourcesSeparator = {
  color: "#d1d5db",
};

const sourceLink = {
  color: "#9ca3af",
  textDecoration: "none",
};

const topicDivider = {
  borderColor: "#e5e7eb",
  margin: "28px 0",
};

const globalEventsSection = {
  padding: "24px 40px",
  backgroundColor: "#fef3c7",
  borderRadius: "8px",
  margin: "32px 40px",
};

const globalEventsHeading = {
  color: "#92400e",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 16px",
};

const eventContainer = {
  marginBottom: "16px",
};

const eventTitle = {
  color: "#78350f",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 8px",
};

const eventDescription = {
  color: "#92400e",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 4px",
};

const eventCategory = {
  color: "#b45309",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0",
};

const footer = {
  padding: "32px 40px",
  borderTop: "1px solid #e6ebf1",
};

const footerText = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "24px",
  textAlign: "center" as const,
  margin: "0 0 12px",
};

const footerLink = {
  color: "#4f46e5",
  textDecoration: "underline",
};

const brandingText = {
  color: "#9ca3af",
  fontSize: "12px",
  textAlign: "center" as const,
  margin: "0",
};
