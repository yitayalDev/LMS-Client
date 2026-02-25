import React from 'react';

interface StarRatingProps {
    rating: number; // 0 to 5
    count?: number; // Number of reviews
    size?: 'small' | 'medium' | 'large';
    readonly?: boolean;
    onChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({
    rating,
    count,
    size = 'medium',
    readonly = true,
    onChange
}) => {
    const stars = [1, 2, 3, 4, 5];

    const sizeClasses = {
        small: 'w-4 h-4 text-sm',
        medium: 'w-5 h-5 text-base',
        large: 'w-8 h-8 text-xl'
    };

    return (
        <div className="flex items-center gap-1">
            <div className="flex">
                {stars.map((star) => (
                    <svg
                        key={star}
                        onClick={() => !readonly && onChange && onChange(star)}
                        className={`
                            ${sizeClasses[size].split(' ')[0]} ${sizeClasses[size].split(' ')[1]} 
                            ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}
                            ${!readonly ? 'cursor-pointer hover:text-yellow-400 transition-colors' : ''}
                        `}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>

            {(rating > 0 || (count !== undefined && count > 0)) && (
                <span className={`font-semibold text-gray-700 ml-1 ${sizeClasses[size].split(' ')[2]}`}>
                    {rating.toFixed(1)}
                </span>
            )}

            {count !== undefined && (
                <span className={`text-gray-500 ml-1 ${sizeClasses[size].split(' ')[2]}`}>
                    ({count} {count === 1 ? 'review' : 'reviews'})
                </span>
            )}
        </div>
    );
};

export default StarRating;
