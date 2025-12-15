"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import Button from "./Button";

type ConsultationFormData = {
  name: string;
  email: string;
  phone: string;
  businessType: string;
  businessSize: string;
  preferredDate: string;
  preferredTime: string;
  meetingType: string;
  challenges: string;
};

export default function ConsultationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConsultationFormData>();

  const onSubmit = async (data: ConsultationFormData) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/consultation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit consultation request");
      }

      setSubmitStatus("success");
      reset();
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
          Full Name *
        </label>
        <input
          id="name"
          type="text"
          {...register("name", { required: "Name is required" })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="John Smith"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
          Email *
        </label>
        <input
          id="email"
          type="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="john@business.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
          Phone Number *
        </label>
        <input
          id="phone"
          type="tel"
          {...register("phone", { required: "Phone number is required" })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="(555) 123-4567"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      {/* Business Type */}
      <div>
        <label htmlFor="businessType" className="block text-sm font-semibold text-gray-700 mb-2">
          Business Type *
        </label>
        <select
          id="businessType"
          {...register("businessType", { required: "Please select your business type" })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Select your industry...</option>
          <option value="retail">Retail</option>
          <option value="restaurant">Restaurant/Food Service</option>
          <option value="professional">Professional Services</option>
          <option value="healthcare">Healthcare</option>
          <option value="ecommerce">E-commerce</option>
          <option value="manufacturing">Manufacturing</option>
          <option value="other">Other</option>
        </select>
        {errors.businessType && (
          <p className="mt-1 text-sm text-red-600">{errors.businessType.message}</p>
        )}
      </div>

      {/* Business Size */}
      <div>
        <label htmlFor="businessSize" className="block text-sm font-semibold text-gray-700 mb-2">
          Business Size *
        </label>
        <select
          id="businessSize"
          {...register("businessSize", { required: "Please select your business size" })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Select size...</option>
          <option value="1-5">1-5 employees</option>
          <option value="6-20">6-20 employees</option>
          <option value="21-50">21-50 employees</option>
          <option value="51+">51+ employees</option>
        </select>
        {errors.businessSize && (
          <p className="mt-1 text-sm text-red-600">{errors.businessSize.message}</p>
        )}
      </div>

      {/* Meeting Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Meeting Preference *
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              value="virtual"
              {...register("meetingType", { required: "Please select a meeting type" })}
              className="mr-3 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-gray-700">Virtual (Video Call)</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="in-person"
              {...register("meetingType", { required: "Please select a meeting type" })}
              className="mr-3 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-gray-700">In-Person</span>
          </label>
        </div>
        {errors.meetingType && (
          <p className="mt-1 text-sm text-red-600">{errors.meetingType.message}</p>
        )}
      </div>

      {/* Preferred Date */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="preferredDate" className="block text-sm font-semibold text-gray-700 mb-2">
            Preferred Date *
          </label>
          <input
            id="preferredDate"
            type="date"
            {...register("preferredDate", { required: "Please select a date" })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.preferredDate && (
            <p className="mt-1 text-sm text-red-600">{errors.preferredDate.message}</p>
          )}
        </div>

        {/* Preferred Time */}
        <div>
          <label htmlFor="preferredTime" className="block text-sm font-semibold text-gray-700 mb-2">
            Preferred Time *
          </label>
          <select
            id="preferredTime"
            {...register("preferredTime", { required: "Please select a time" })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select time...</option>
            <option value="9:00 AM">9:00 AM</option>
            <option value="10:00 AM">10:00 AM</option>
            <option value="11:00 AM">11:00 AM</option>
            <option value="1:00 PM">1:00 PM</option>
            <option value="2:00 PM">2:00 PM</option>
            <option value="3:00 PM">3:00 PM</option>
            <option value="4:00 PM">4:00 PM</option>
          </select>
          {errors.preferredTime && (
            <p className="mt-1 text-sm text-red-600">{errors.preferredTime.message}</p>
          )}
        </div>
      </div>

      {/* Challenges */}
      <div>
        <label htmlFor="challenges" className="block text-sm font-semibold text-gray-700 mb-2">
          What challenges are you facing? *
        </label>
        <textarea
          id="challenges"
          {...register("challenges", { required: "Please describe your challenges" })}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          placeholder="Tell us about the friction points in your business that you'd like AI to help solve..."
        />
        {errors.challenges && (
          <p className="mt-1 text-sm text-red-600">{errors.challenges.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div>
        <Button
          type="submit"
          size="lg"
          className="w-full"
          onClick={undefined}
        >
          {isSubmitting ? "Booking..." : "Book My Free Consultation"}
        </Button>
      </div>

      {/* Status Messages */}
      {submitStatus === "success" && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-semibold mb-2">
            ✓ Consultation Booked Successfully!
          </p>
          <p className="text-green-700">
            We&apos;ll send you a confirmation email shortly and reach out within 24 hours
            to confirm your preferred time slot.
          </p>
        </div>
      )}

      {submitStatus === "error" && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-semibold">
            ✗ Something went wrong. Please try again or call us at (555) 123-4567.
          </p>
        </div>
      )}

      {/* Privacy Note */}
      <p className="text-sm text-gray-600 text-center">
        By submitting this form, you agree to our{" "}
        <a href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</a>.
        We&apos;ll never share your information.
      </p>
    </form>
  );
}
