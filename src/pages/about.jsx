import React from "react";
import Logo from "../assets/images/logo.png";
import Header from "../components/header";
import Footer from "../components/footer";
export default function AboutUs() {
  return (
    <div>
      <Header />
      <div className="= min-h-screen">
        {/* HERO */}
        <section className="relative overflow-hidden bg-black text-white">
          <img
            src="https://plus.unsplash.com/premium_photo-1721861983813-46ce2f2ae323?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Community"
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 lg:py-36 py-28">
            <div className="max-w-3xl">
              <p className="uppercase tracking-[0.3em] text-sm text-gray-300 mb-5">
                About Us
              </p>

              <h1 className="text-4xl lg:text-[50px] font-bold leading-tight">
                Building Stronger Families & Communities
              </h1>

              <p className="mt-8 text-[15px] md:text-[16px] text-gray-200 max-w-2xl leading-relaxed">
                At St. Stephen's Family, we are committed to empowering children,
                supporting parents, and creating safe environments where
                families can thrive emotionally, socially, and spiritually.
              </p>
            </div>
          </div>
        </section>

        {/* STORY */}
        <section className="py-24 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-4">
                Our Story
              </p>

              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Creating meaningful impact through care and support.
              </h2>

              <p className="mt-8 text-lg text-gray-600 leading-relaxed">
                We believe every child deserves access to guidance, emotional
                support, and opportunities that help them grow confidently.
              </p>

              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                Through family-centered programs, therapy support, education,
                and community outreach, we continue to serve families with
                compassion, dignity, and excellence.
              </p>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=1200&auto=format&fit=crop"
                alt="Family support"
                className="w-full h-[620px] object-cover rounded-[40px] rounded-tr-[140px]"
              />

              <div className="absolute -bottom-10 left-8 bg-white p-8 rounded-[30px] shadow-2xl max-w-xs">
                <h3 className="text-5xl font-bold text-black">10+</h3>
                <p className="mt-2 text-gray-600">
                  Years supporting children and families across communities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* VALUES */}
        <section className="py-24 bg-white px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto">
              <p className="uppercase tracking-[0.3em] text-sm text-gray-500 mb-4">
                Our Values
              </p>

              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
                What guides everything we do
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
              {[
                {
                  title: "Compassion",
                  desc: "We lead with empathy, kindness, and genuine care for every family.",
                },
                {
                  title: "Integrity",
                  desc: "We maintain honesty, accountability, and trust in our services.",
                },
                {
                  title: "Community",
                  desc: "We foster strong connections that uplift families together.",
                },
                {
                  title: "Growth",
                  desc: "We help children and families develop confidence and resilience.",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-[#f8f8f8] p-8 rounded-[32px] hover:-translate-y-2 transition duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center text-xl font-bold">
                    0{index + 1}
                  </div>

                  <h3 className="mt-8 text-2xl font-bold text-gray-900">
                    {item.title}
                  </h3>

                  <p className="mt-4 text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto bg-black text-white rounded-[50px] p-10 lg:p-20 relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1031&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Community support"
              className="absolute inset-0 w-full h-full object-cover opacity-25"
            />
            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <div>
                <p className="uppercase tracking-[0.3em] text-sm text-gray-300 mb-4">
                  Our Mission
                </p>

                <h2 className="text-4xl lg:text-[50px] font-bold leading-tight">
                  Empowering children and strengthening families every day.
                </h2>

                <p className="mt-8 text-lg text-gray-200 leading-relaxed max-w-2xl">
                  We provide compassionate support, therapy resources,
                  educational guidance, and community-centered programs designed
                  to help every child reach their full potential.
                </p>

                <div className="flex flex-wrap gap-5 mt-10">
                  <button className="bg-white text-black px-8 py-4 rounded-full font-semibold hover:scale-105 transition">
                    Get Support
                  </button>

                  <button className="border border-white/40 text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-black transition">
                    Learn More
                  </button>
                </div>
              </div>

              {/* Right Stats */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-md rounded-[30px] p-8 border border-white/10">
                  <h3 className="text-5xl font-bold">500+</h3>
                  <p className="mt-3 text-gray-300 leading-relaxed">
                    Families supported through our programs and outreach
                    initiatives.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-[30px] p-8 border border-white/10">
                  <h3 className="text-5xl font-bold">10+</h3>
                  <p className="mt-3 text-gray-300 leading-relaxed">
                    Years of community-centered care and family support
                    services.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-[30px] p-8 border border-white/10">
                  <h3 className="text-5xl font-bold">95%</h3>
                  <p className="mt-3 text-gray-300 leading-relaxed">
                    Positive family feedback from our support and therapy
                    programs.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-[30px] p-8 border border-white/10">
                  <h3 className="text-5xl font-bold">24/7</h3>
                  <p className="mt-3 text-gray-300 leading-relaxed">
                    Commitment to creating safe and supportive environments for
                    children.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer/>
    </div>
  );
}
