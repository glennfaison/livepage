import type { PageTemplateDefinition } from "@/client/features/templates/schema"

type TemplateNode = Readonly<{
  tag: string
  attributes: Readonly<Record<string, string>>
  children: ReadonlyArray<TemplateNode | string>
}>

function node(
  tag: string,
  id: string,
  attributes: Readonly<Record<string, string>> = {},
  children: ReadonlyArray<TemplateNode | string> = [],
): TemplateNode {
  return { tag, attributes: { id, ...attributes }, children } as const
}

const text = (
  tag: "header1" | "header2" | "header3" | "paragraph" | "badge" | "button" | "callout" | "inline-text",
  id: string,
  content: string,
  attributes: Readonly<Record<string, string>> = {},
) => node(tag, id, attributes, [content])

function detailRow(id: string, labelText: string, valueText: string): TemplateNode {
  return node("column", id, { gap: "0.125rem" }, [
    text("inline-text", `${id}-label`, labelText, { "custom-classes": "text-xs font-medium uppercase tracking-wide text-slate-400" }),
    text("inline-text", `${id}-value`, valueText, { "custom-classes": "text-sm font-semibold text-slate-900" }),
  ])
}

function patientRow(id: string, name: string, meta: string, avatarSlug: string, active = false): TemplateNode {
  return node("row", id, {
    "child-sizing": "natural",
    "align-items": "center",
    gap: "0.75rem",
    "padding-top": "0.5rem",
    "padding-right": "0.5rem",
    "padding-bottom": "0.5rem",
    "padding-left": "0.5rem",
    "custom-classes": active ? "rounded-lg bg-teal-50" : "rounded-lg",
  }, [
    node("image", `${id}-avatar`, {
      src: `/avatars/${avatarSlug}.svg`,
      alt: `${name} avatar`,
      width: "44px",
      height: "44px",
      borderRadius: "50%",
      objectFit: "cover",
      "custom-classes": "shrink-0 ring-2 ring-white",
    }),
    node("column", `${id}-info`, { gap: "0" }, [
      text("inline-text", `${id}-name`, name, { "custom-classes": "text-sm font-semibold text-slate-900" }),
      text("inline-text", `${id}-meta`, meta, { "custom-classes": "text-xs text-slate-500" }),
    ]),
  ])
}

function labResultRow(id: string, name: string): TemplateNode {
  return node("row", id, {
    "align-items": "center",
    "justify-content": "between",
    "padding-top": "0.5rem",
    "padding-bottom": "0.5rem",
    "custom-classes": "border-b border-slate-100 last:border-0",
  }, [
    text("inline-text", `${id}-name`, name, { "custom-classes": "text-sm text-slate-700" }),
    node("link", `${id}-download`, { href: "#", "custom-classes": "text-xs font-semibold text-teal-600 hover:text-teal-700" }, ["Download"]),
  ])
}

export const patientHealthDashboardTemplate = {
  schema: "livepage-template",
  version: 1,
  id: "patient-health-dashboard",
  metadata: {
    name: "Patient Health Dashboard",
    description: "A clinician-facing dashboard with a patient list, vitals trend chart, key metric tiles, a diagnostic list, and a patient profile sidebar.",
    category: "Dashboard",
    tags: ["dashboard", "healthcare", "patients", "analytics", "admin", "linkedin import"],
    thumbnail: "/template-thumbnails/patient-health-dashboard.svg",
  },
  dataMapping: {
    source: "linkedin-profile",
    fields: [
      {
        source: "name",
        description: "Reused as the signed-in clinician's display name in the top navigation account menu.",
        targets: [{ componentId: "phd-doctor-name", kind: "text", field: "children" }],
      },
      {
        source: "headline",
        description: "Reused as the clinician's role/title shown beneath their name.",
        targets: [{ componentId: "phd-doctor-role", kind: "text", field: "children" }],
      },
    ],
  },
  content: {
    pages: [
      node("page", "patient-health-dashboard-page", {
        title: "Tech.Care — Patient Dashboard",
        "custom-classes": "border-0 bg-slate-50 shadow-none",
      }, [
        node("column", "phd-shell", { gap: "0", "custom-classes": "mx-auto w-full bg-slate-50" }, [
          node("row", "phd-navbar", {
            "child-sizing": "natural",
            "align-items": "center",
            "justify-content": "between",
            "padding-top": "1rem",
            "padding-right": "2rem",
            "padding-bottom": "1rem",
            "padding-left": "2rem",
            gap: "1rem",
            "custom-classes": "w-full flex-wrap border-b border-slate-200 bg-white",
          }, [
            text("inline-text", "phd-brand", "Tech.Care", { "custom-classes": "text-lg font-semibold text-slate-900" }),
            node("row", "phd-nav-links", { "child-sizing": "natural", "align-items": "center", gap: "1.5rem", "custom-classes": "flex-wrap" }, [
              node("link", "phd-nav-overview", { href: "#overview", "custom-classes": "text-sm font-medium text-slate-600 hover:text-slate-900" }, ["Overview"]),
              text("badge", "phd-nav-patients", "Patients", { variant: "default", "custom-classes": "rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-white" }),
              node("link", "phd-nav-schedule", { href: "#schedule", "custom-classes": "text-sm font-medium text-slate-600 hover:text-slate-900" }, ["Schedule"]),
              node("link", "phd-nav-message", { href: "#message", "custom-classes": "text-sm font-medium text-slate-600 hover:text-slate-900" }, ["Message"]),
              node("link", "phd-nav-transactions", { href: "#transactions", "custom-classes": "text-sm font-medium text-slate-600 hover:text-slate-900" }, ["Transactions"]),
            ]),
            node("row", "phd-nav-account", { "child-sizing": "natural", "align-items": "center", gap: "0.75rem" }, [
              node("image", "phd-doctor-avatar", {
                src: "/avatars/dr-jose-simmons.svg",
                alt: "Doctor avatar",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                objectFit: "cover",
              }),
              node("column", "phd-doctor-info", { gap: "0" }, [
                text("inline-text", "phd-doctor-name", "Dr. Jose Simmons", { "custom-classes": "text-sm font-semibold text-slate-900" }),
                text("inline-text", "phd-doctor-role", "General Practitioner", { "custom-classes": "text-xs text-slate-500" }),
              ]),
            ]),
          ]),
          node("row", "phd-content", {
            "child-sizing": "natural",
            "align-items": "start",
            gap: "1.5rem",
            "padding-top": "1.5rem",
            "padding-right": "2rem",
            "padding-bottom": "2rem",
            "padding-left": "2rem",
            "custom-classes": "flex-wrap lg:flex-nowrap",
          }, [
            node("column", "phd-patients-col", { gap: "0.75rem", "padding-top": "1rem", "padding-right": "1rem", "padding-bottom": "1rem", "padding-left": "1rem", "custom-classes": "w-full lg:w-72 shrink-0 rounded-2xl border border-slate-200 bg-white" }, [
              text("header3", "phd-patients-heading", "Patients", { "custom-classes": "py-0 text-lg font-semibold text-slate-900" }),
              node("column", "phd-patients-list", { gap: "0.25rem" }, [
                patientRow("phd-patient-1", "Emily Williams", "Female, 18", "emily-williams", true),
                patientRow("phd-patient-2", "Ryan Johnson", "Male, 45", "ryan-johnson"),
                patientRow("phd-patient-3", "Brandon Mitchell", "Male, 36", "brandon-mitchell"),
                patientRow("phd-patient-4", "Jessica Taylor", "Female, 28", "jessica-taylor"),
                patientRow("phd-patient-5", "Samantha Johnson", "Female, 56", "samantha-johnson"),
                patientRow("phd-patient-6", "Ashley Martinez", "Female, 54", "ashley-martinez"),
              ]),
            ]),
            node("column", "phd-main-col", { gap: "1.5rem", "custom-classes": "min-w-0 flex-1" }, [
              node("column", "phd-diagnosis-card", { gap: "1rem", "padding-top": "1.25rem", "padding-right": "1.25rem", "padding-bottom": "1.25rem", "padding-left": "1.25rem", "custom-classes": "rounded-2xl border border-slate-200 bg-white" }, [
                text("header3", "phd-diagnosis-heading", "Diagnosis History", { "custom-classes": "py-0 text-lg font-semibold text-slate-900" }),
                node("row", "phd-diagnosis-row", { gap: "1.5rem", "align-items": "stretch", "custom-classes": "flex-wrap lg:flex-nowrap" }, [
                  node("column", "phd-chart-col", { "custom-classes": "min-w-0 flex-1" }, [
                    node("line-chart", "phd-bp-chart", {
                      title: "Blood Pressure",
                      categories: JSON.stringify(["Oct 2023", "Nov 2023", "Dec 2023", "Jan 2024", "Feb 2024", "Mar 2024"]),
                      "series-a-label": "Systolic",
                      "series-a-color": "#ec4899",
                      "series-a-values": JSON.stringify([120, 120, 138, 158, 163, 163]),
                      "series-b-label": "Diastolic",
                      "series-b-color": "#8b5cf6",
                      "series-b-values": JSON.stringify([80, 95, 92, 80, 120, 95]),
                      "y-min": "60",
                      "y-max": "180",
                      "custom-classes": "border-0 bg-transparent p-0 shadow-none",
                    }),
                  ]),
                  node("column", "phd-legend-col", { gap: "1.25rem", "custom-classes": "w-full lg:w-56 shrink-0" }, [
                    node("column", "phd-systolic-group", { gap: "0.25rem" }, [
                      text("inline-text", "phd-systolic-label", "Systolic", { "custom-classes": "text-xs font-medium uppercase tracking-wide text-pink-500" }),
                      text("header2", "phd-systolic-value", "163", { "custom-classes": "py-0 text-3xl font-semibold text-slate-900" }),
                      text("badge", "phd-systolic-trend", "Higher than Average", { variant: "warning", "custom-classes": "w-fit rounded-full" }),
                    ]),
                    node("column", "phd-diastolic-group", { gap: "0.25rem" }, [
                      text("inline-text", "phd-diastolic-label", "Diastolic", { "custom-classes": "text-xs font-medium uppercase tracking-wide text-violet-500" }),
                      text("header2", "phd-diastolic-value", "95", { "custom-classes": "py-0 text-3xl font-semibold text-slate-900" }),
                      text("badge", "phd-diastolic-trend", "Normal", { variant: "success", "custom-classes": "w-fit rounded-full" }),
                    ]),
                  ]),
                ]),
              ]),
              node("row", "phd-metrics-row", { gap: "1.25rem", "custom-classes": "flex-wrap md:flex-nowrap" }, [
                node("column", "phd-metric-col-1", { "custom-classes": "min-w-0 flex-1" }, [
                  node("metric-card", "phd-metric-respiratory", { icon: "wind", tone: "blue", value: "27", unit: "bpm", label: "Respiratory Rate", trend: "none", "trend-label": "Normal" }),
                ]),
                node("column", "phd-metric-col-2", { "custom-classes": "min-w-0 flex-1" }, [
                  node("metric-card", "phd-metric-temperature", { icon: "thermometer", tone: "yellow", value: "103", unit: "°F", label: "Temperature", trend: "up", "trend-label": "Higher than Average" }),
                ]),
                node("column", "phd-metric-col-3", { "custom-classes": "min-w-0 flex-1" }, [
                  node("metric-card", "phd-metric-heart", { icon: "heart", tone: "pink", value: "79", unit: "bpm", label: "Heart Rate", trend: "down", "trend-label": "Lower than Average" }),
                ]),
              ]),
              node("column", "phd-diagnostic-card", { gap: "1rem", "padding-top": "1.25rem", "padding-right": "1.25rem", "padding-bottom": "1.25rem", "padding-left": "1.25rem", "custom-classes": "rounded-2xl border border-slate-200 bg-white" }, [
                text("header3", "phd-diagnostic-heading", "Diagnostic List", { "custom-classes": "py-0 text-lg font-semibold text-slate-900" }),
                node("data-table", "phd-diagnostic-table", {
                  columns: JSON.stringify(["Problem/Diagnosis", "Description", "Status"]),
                  rows: JSON.stringify([
                    ["Type 2 Diabetes", "A chronic condition that affects the way the body processes blood sugar (glucose).", "Actively being treated"],
                    ["Type 2 Diabetes", "A chronic condition that affects the way the body processes blood sugar (glucose).", "Untreated"],
                    ["Hypertension", "A condition in which the force of the blood against the artery walls is too high.", "Under observation"],
                  ]),
                  "custom-classes": "border-0 shadow-none",
                }),
              ]),
            ]),
            node("column", "phd-sidebar-col", { gap: "1.5rem", "custom-classes": "w-full lg:w-80 shrink-0" }, [
              node("column", "phd-profile-card", { gap: "0.75rem", "align-items": "center", "padding-top": "1.5rem", "padding-right": "1.25rem", "padding-bottom": "1.5rem", "padding-left": "1.25rem", "custom-classes": "rounded-2xl border border-slate-200 bg-white text-center" }, [
                node("image", "phd-profile-avatar", {
                  src: "/avatars/emily-williams.svg",
                  alt: "Emily Williams",
                  width: "96px",
                  height: "96px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }),
                text("header3", "phd-profile-name", "Emily Williams", { "custom-classes": "py-0 text-lg font-semibold text-slate-900" }),
                node("column", "phd-profile-details", { gap: "0.75rem", "custom-classes": "w-full text-left" }, [
                  detailRow("phd-profile-dob", "Date of Birth", "August 19, 2006"),
                  detailRow("phd-profile-gender", "Gender", "Female"),
                  detailRow("phd-profile-contact", "Contact Info", "(711) 984-6696"),
                  detailRow("phd-profile-emergency", "Emergency Contacts", "(680) 653-9512"),
                  detailRow("phd-profile-insurance", "Insurance Provider", "Premier Auto Corporation"),
                ]),
                node("button", "phd-profile-cta", { variant: "default", size: "default", "custom-classes": "w-full rounded-full bg-teal-500 hover:bg-teal-600" }, ["Show All Information"]),
              ]),
              node("column", "phd-labresults-card", { gap: "0.5rem", "padding-top": "1.25rem", "padding-right": "1.25rem", "padding-bottom": "1.25rem", "padding-left": "1.25rem", "custom-classes": "rounded-2xl border border-slate-200 bg-white" }, [
                text("header3", "phd-labresults-heading", "Lab Results", { "custom-classes": "py-0 text-lg font-semibold text-slate-900" }),
                node("column", "phd-labresults-list", { gap: "0" }, [
                  labResultRow("phd-lab-1", "Complete Blood Count (CBC)"),
                  labResultRow("phd-lab-2", "Echocardiogram"),
                  labResultRow("phd-lab-3", "Liver Function Tests"),
                  labResultRow("phd-lab-4", "Mammography"),
                  labResultRow("phd-lab-5", "Urinalysis"),
                ]),
              ]),
            ]),
          ]),
        ]),
      ]),
    ],
  },
} as const satisfies PageTemplateDefinition
