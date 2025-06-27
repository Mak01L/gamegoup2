import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: number;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt = 'avatar', size = 40 }) => (
  <img
    src={src || '/default-avatar.png'}
    alt={alt}
    width={size}
    height={size}
    className="rounded-full border-2 border-purple-400 bg-[#18122B] object-cover"
    style={{ width: size, height: size }}
  />
);

export default Avatar;
