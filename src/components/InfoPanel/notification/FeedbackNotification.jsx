import React from 'react';

export default function FeedbackNotification() {
  return (
    <div>
      <h2 className="font-semibold mb-2">Feedback & Suggestions</h2>
      <p>
        We value your ideas and suggestions to improve the Smart Cube Timer experience.
        If you have any feedback, questions, or proposals, feel free to reach out.
      </p>
      <p className="mt-2">
        Please contact us at{' '}
        <a
          href="mailto:sheshko_alexei@vk.com"
          className="text-blue-600 underline"
        >
          email
        </a>
      </p>
    </div>
  );
}