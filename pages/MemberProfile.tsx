
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Member } from '../types';
import { slugify, normalizeLinkedInUrl } from '../utils/helpers';

interface RawMember {
  name: string;
  linkedin: string;
  current_role_what_i_do: string;
  fun_fact_s: string | string[];
  topics_to_ask_me_about: string | string[];
  tags?: string | string[]; // Added new optional field
}

// Helper to process raw data into Member type
const processMemberData = (item: RawMember): Member => {
  return {
    ...item,
    linkedin: normalizeLinkedInUrl(item.linkedin),
    fun_fact_s: Array.isArray(item.fun_fact_s) ? item.fun_fact_s : (item.fun_fact_s || '').split(',').map((s: string) => s.trim()).filter(Boolean),
    topics_to_ask_me_about: Array.isArray(item.topics_to_ask_me_about) ? item.topics_to_ask_me_about : (item.topics_to_ask_me_about || '').split(',').map((s: string) => s.trim()).filter(Boolean),
    tags: Array.isArray(item.tags) ? item.tags : (item.tags || '').split(',').map((s: string) => s.trim()).filter(Boolean), // Process tags
    slug: slugify(item.name),
  };
};

const MemberProfile: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        const response = await fetch('/discord_intros_data.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rawData: RawMember[] = await response.json();
        const foundMember = rawData
          .map(processMemberData) // Process all members to find the one matching the slug
          .find((m) => m.slug === slug);

        if (foundMember) {
          setMember(foundMember);
        } else {
          setError('Member not found.');
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [slug]);

  if (loading) {
    return (
      <main className="container mx-auto p-4 md:p-8 flex-grow text-center text-light-text text-lg mt-16">
        Loading member profile...
      </main>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center text-red-600 text-lg mt-16">
        <p>{error}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-accent-blue transition-colors duration-300"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  if (!member) {
    // This case should ideally be caught by error state, but as a fallback:
    return (
      <div className="container mx-auto p-4 md:p-8 text-center text-light-text text-lg mt-16">
        <p>Member not found.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-accent-blue transition-colors duration-300"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  // Use DiceBear for fun stick figure/persona images
  const avatarImageUrl = `https://api.dicebear.com/7.x/personas/svg?seed=${member.slug}&radius=10`; // Slightly rounded for profile

  return (
    <main className="container mx-auto p-4 md:p-8 flex-grow">
      <div className="bg-white rounded-lg shadow-xl p-6 md:p-10 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:space-x-8">
          <div className="w-full md:w-1/3 flex-shrink-0 mb-6 md:mb-0">
            <img
              src={avatarImageUrl}
              alt={`Profile of ${member.name}`}
              className="w-full rounded-lg shadow-md object-cover h-64 md:h-full bg-gray-100 p-6" // Added padding and background for SVG visibility
            />
          </div>
          <div className="md:w-2/3 flex-grow">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-blue mb-3">
              {member.name}
            </h2>
            <p className="text-xl text-light-text mb-6">
              {member.current_role_what_i_do}
            </p>

            {member.fun_fact_s.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-accent-blue mb-2">Fun Fact(s)</h3>
                <ul className="list-disc list-inside text-light-text space-y-1">
                  {member.fun_fact_s.map((fact, index) => (
                    <li key={index}>{fact}</li>
                  ))}
                </ul>
              </div>
            )}

            {member.topics_to_ask_me_about.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-accent-blue mb-2">Topics to Ask Me About</h3>
                <ul className="list-disc list-inside text-light-text space-y-1">
                  {member.topics_to_ask_me_about.map((topic, index) => (
                    <li key={index}>{topic}</li>
                  ))}
                </ul>
              </div>
            )}

            {member.tags && member.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-accent-blue mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {member.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {member.linkedin && (
              <div className="mt-6">
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-accent-blue transition-colors duration-300"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M19 0H5a5 5 0 00-5 5v14a5 5 0 005 5h14a5 5 0 005-5V5a5 5 0 00-5-5zM8 19H5V8h3v11zM6.5 6.75A1.75 1.75 0 118.25 5 1.75 1.75 0 016.5 6.75zM19 19h-3v-4.7C16 12.3 15.2 12 14 12c-1.8 0-2 1.2-2 2.8V19h-3V8h3v1.9c.5-.9 1.4-1.9 3-1.9 3.5 0 4 2.3 4 5.7V19z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Connect on LinkedIn
                </a>
              </div>
            )}
          </div>
        </div>
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-gray-200 text-dark-text rounded-lg hover:bg-gray-300 transition-colors duration-300"
          >
            ← Back to Directory
          </button>
        </div>
      </div>
    </main>
  );
};

export default MemberProfile;