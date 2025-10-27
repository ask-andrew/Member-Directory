

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import MemberCard from '../components/MemberCard';
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

const processMemberData = (data: RawMember[]): Member[] => {
  return data.map((item) => ({
    ...item,
    linkedin: normalizeLinkedInUrl(item.linkedin),
    fun_fact_s: Array.isArray(item.fun_fact_s) ? item.fun_fact_s : (item.fun_fact_s || '').split(',').map((s: string) => s.trim()).filter(Boolean),
    topics_to_ask_me_about: Array.isArray(item.topics_to_ask_me_about) ? item.topics_to_ask_me_about : (item.topics_to_ask_me_about || '').split(',').map((s: string) => s.trim()).filter(Boolean),
    tags: Array.isArray(item.tags) ? item.tags : (item.tags || '').split(',').map((s: string) => s.trim()).filter(Boolean), // Process tags
    slug: slugify(item.name),
  }));
};

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allTopics, setAllTopics] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [showTopicFilters, setShowTopicFilters] = useState<boolean>(false); // State for filter visibility

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch('/discord_intros_data.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rawData: RawMember[] = await response.json();
        const processedData = processMemberData(rawData);
        setMembers(processedData);

        // Extract all unique topics for filtering
        const topics = new Set<string>();
        processedData.forEach(member => {
          member.topics_to_ask_me_about.forEach(topic => topics.add(topic));
        });
        setAllTopics(Array.from(topics).sort()); // Sort topics alphabetically
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const handleTopicToggle = useCallback((topic: string) => {
    setSelectedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topic)) {
        newSet.delete(topic);
      } else {
        newSet.add(topic);
      }
      return newSet;
    });
  }, []);

  const clearTopicFilters = useCallback(() => {
    setSelectedTopics(new Set());
  }, []);

  const filteredMembers = useMemo(() => {
    let currentMembers = members;

    // 1. Filter by selected topics (OR logic)
    if (selectedTopics.size > 0) {
      currentMembers = currentMembers.filter(member =>
        member.topics_to_ask_me_about.some(topic => selectedTopics.has(topic))
      );
    }

    // 2. Filter by search term
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentMembers = currentMembers.filter(
        (member) =>
          member.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          member.current_role_what_i_do.toLowerCase().includes(lowerCaseSearchTerm) ||
          member.topics_to_ask_me_about.some((topic) =>
            topic.toLowerCase().includes(lowerCaseSearchTerm)
          ) ||
          (member.tags && member.tags.some((tag) => tag.toLowerCase().includes(lowerCaseSearchTerm))) // Search by tags
      );
    }
    return currentMembers;
  }, [searchTerm, members, selectedTopics]);

  if (loading) {
    return (
      <main className="container mx-auto p-4 md:p-8 flex-grow text-center text-light-text text-lg mt-16">
        Loading members...
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto p-4 md:p-8 flex-grow text-center text-red-600 text-lg mt-16">
        Error loading members: {error}
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 md:p-8 flex-grow">
      <div className="max-w-xl mx-auto mb-8">
        <input
          type="text"
          placeholder="Search members by name, role, topics, or tags..."
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search members"
        />
      </div>

      {allTopics.length > 0 && (
        <div className="mb-8 max-w-4xl mx-auto">
          <button
            onClick={() => setShowTopicFilters(!showTopicFilters)}
            className="flex items-center justify-between w-full px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-accent-blue transition-colors duration-200 text-base font-semibold shadow-md"
            aria-expanded={showTopicFilters}
            aria-controls="topic-filters-panel"
          >
            Filter by Topics
            <svg
              className={`w-5 h-5 ml-2 transition-transform duration-300 ${
                showTopicFilters ? 'rotate-180' : ''
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
          <div
            id="topic-filters-panel"
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              showTopicFilters ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="p-4 bg-white rounded-lg shadow-inner border border-gray-200">
              <h3 className="text-lg font-semibold text-dark-text mb-3">Select Topics:</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {allTopics.map(topic => (
                  <button
                    key={topic}
                    onClick={() => handleTopicToggle(topic)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                      ${selectedTopics.has(topic)
                        ? 'bg-accent-blue text-white shadow-md'
                        : 'bg-gray-200 text-dark-text hover:bg-gray-300'
                      }`}
                    aria-pressed={selectedTopics.has(topic)}
                  >
                    {topic}
                  </button>
                ))}
              </div>
              {selectedTopics.size > 0 && (
                <button
                  onClick={clearTopicFilters}
                  className="px-4 py-2 mt-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {filteredMembers.length === 0 ? (
        <p className="text-center text-light-text text-lg mt-16">No members found matching your search criteria.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member) => (
            <MemberCard key={member.slug} member={member} />
          ))}
        </div>
      )}
    </main>
  );
};

export default Home;