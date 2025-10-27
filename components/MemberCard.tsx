import React from 'react';
import { Link } from 'react-router-dom';
import { Member } from '../types';

interface MemberCardProps {
  member: Member;
}

const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  // Use DiceBear for fun stick figure/persona images
  const avatarImageUrl = `https://api.dicebear.com/7.x/personas/svg?seed=${member.slug}`;

  return (
    <Link to={`/member/${member.slug}`} className="block">
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden h-full flex flex-col">
        <img
          src={avatarImageUrl}
          alt={`Profile of ${member.name}`}
          className="w-full h-48 object-cover bg-gray-100 p-4" // Added padding and background for SVG visibility
        />
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg md:text-xl font-semibold text-primary-blue mb-2">
            {member.name}
          </h3>
          <p className="text-sm text-light-text flex-grow">
            {member.current_role_what_i_do.length > 100
              ? `${member.current_role_what_i_do.substring(0, 100)}...`
              : member.current_role_what_i_do}
          </p>
          <div className="mt-4 text-xs text-accent-blue font-medium">
            View Profile
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MemberCard;