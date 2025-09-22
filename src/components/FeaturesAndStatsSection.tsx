import React from "react";
import {
  Bot,
  AlertTriangle,
  CalendarClock,
  Activity,
  ArrowRight,
} from "lucide-react";

const FeaturesAndStatsSection: React.FC = () => {
  const features = [
    {
      icon: <Bot className="h-6 w-6 text-blue-600" />,
      title: "Smart Medication Insights",
      description:
        "AI adjusts dosage & timing based on your personal health data.",
    },
    {
      icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
      title: "Drug Interaction Alerts",
      description:
        "AI automatically detects harmful combinations to ensure your safety.",
    },
    {
      icon: <CalendarClock className="h-6 w-6 text-purple-600" />,
      title: "Personalized Reminders",
      description:
        "Never miss a dose with intelligent reminders tailored to your schedule.",
    },
    {
      icon: <Activity className="h-6 w-6 text-green-600" />,
      title: "Effective Monitoring",
      description:
        "Track your progress and adherence with insightful, easy-to-read reports.",
    },
  ];

  const stats = [
    { value: "10K+", label: "Patients Helped" },
    { value: "98%", label: "Adherence Rate" },
    { value: "1K+", label: "Partner Hospitals" },
    { value: "24/7", label: "Support Available" },
  ];

  return (
    <div className="bg-gray-50 py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* --- Features Section (Unchanged) --- */}
        <section className="mb-24 lg:mb-32">
          <div className="flex flex-col items-center justify-between gap-6 mb-16 md:flex-row">
            <div className="text-center md:text-left">
              <span className="inline-block rounded-md bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                OUR BENEFITS
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                The Smart Way To Manage <br /> Your Prescriptions
              </h2>
            </div>
            <a
              href="#"
              className="group hidden items-center justify-center gap-x-2 rounded-full bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-blue-700 md:inline-flex"
            >
              <span>See How It Works</span>
              <ArrowRight
                size={20}
                className="transition-transform group-hover:translate-x-1"
              />
            </a>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group rounded-2xl bg-gradient-to-br from-blue-200/50 via-white to-white p-px shadow-lg shadow-blue-500/10 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20"
              >
                <div className="flex flex-col h-full rounded-[15px] bg-gradient-to-br from-white to-blue-50/50 p-6 lg:p-8">
                  <div className="flex items-center gap-x-4 mb-4">
                    <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-md">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- Redesigned Stats Section --- */}
        <section>
          <div className="relative rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white shadow-2xl shadow-blue-500/40 lg:p-12">
            {/* Decorative background elements */}

            <div className="relative text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Trusted by Thousands
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-blue-100">
                Join a growing community that relies on our platform for their
                health management needs.
              </p>
            </div>

            <div className="relative mt-12 grid grid-cols-2 gap-8 text-center md:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="text-4xl font-bold lg:text-5xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-blue-200 lg:text-base">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FeaturesAndStatsSection;
