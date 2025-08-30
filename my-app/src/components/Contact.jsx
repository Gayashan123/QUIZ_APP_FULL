import Con from '../assets/contact.jpg'; // Make sure this is a quiz-themed image
import { FiPhoneCall, FiSend } from 'react-icons/fi';
import { HiOutlineMail } from 'react-icons/hi';

function Contact() {
  const contactDetails = [
    {
      icon: <FiPhoneCall className="text-4xl text-indigo-600" />,
      label: 'Call Support',
      value: '+94 75 206 9762',
    },
    {
      icon: <HiOutlineMail className="text-4xl text-indigo-600" />,
      label: 'Email Us',
      value: 'support@quizmaster.com',
    },
  ];

  return (
    <section
      id="contact"
      className="bg-neutral-100 py-12 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="mb-12 text-center" data-aos="fade-down">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-neutral-900 tracking-tight">
          Contact Us
        </h1>
        <p className="mt-3 text-base sm:text-lg md:text-xl text-neutral-600 max-w-xl mx-auto px-2 sm:px-0">
          Have questions about your scores, quizzes, or feedback? Reach out — we’d love to hear from you!
        </p>
      </div>

      {/* Contact Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 mb-12">
        {contactDetails.map((item, i) => (
          <div
            key={i}
            className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-lg transition-transform hover:scale-[1.03]"
            data-aos="fade-up"
            data-aos-delay={i * 200 + 100}
          >
            {item.icon}
            <h3 className="mt-5 text-lg sm:text-xl font-medium text-indigo-700">{item.label}</h3>
            <p className="mt-2 text-neutral-600 text-sm sm:text-base">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Contact Form + Image */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center">
        {/* Image */}
        <div
          className="flex-1 rounded-3xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.03] max-w-full"
          data-aos="fade-right"
        >
          <img
            src={Con}
            alt="Contact Quiz Team"
            className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-3xl"
          />
        </div>

        {/* Form */}
        <form
          className="flex-1 bg-white/80 backdrop-blur-lg rounded-3xl p-6 sm:p-8 shadow-lg max-w-md w-full transition-transform hover:scale-[1.03]"
          data-aos="fade-left"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-6">
            Get in Touch
          </h2>
          <p className="mb-6 text-neutral-600 text-sm sm:text-base">
            Whether you're a quizzer, teacher, or curious mind — leave us a message and we’ll respond promptly!
          </p>

          <label className="block mb-4">
            <span className="text-neutral-700 font-medium mb-2 block text-sm sm:text-base">Your Name</span>
            <input
              type="text"
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm sm:text-base"
              placeholder="Alex Gamer"
            />
          </label>

          <label className="block mb-4">
            <span className="text-neutral-700 font-medium mb-2 block text-sm sm:text-base">Your Email</span>
            <input
              type="email"
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm sm:text-base"
              placeholder="alex@example.com"
            />
          </label>

          <label className="block mb-6">
            <span className="text-neutral-700 font-medium mb-2 block text-sm sm:text-base">Your Message</span>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm sm:text-base"
              placeholder="Ask us anything about quizzes or your account..."
            />
          </label>

          <button
            type="submit"
            className="w-full flex justify-center items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md transition text-base sm:text-lg"
          >
            <span>Submit</span>
            <FiSend className="text-xl" />
          </button>
        </form>
      </div>
    </section>
  );
}

export default Contact;
