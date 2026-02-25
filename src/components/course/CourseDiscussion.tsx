import React, { useState, useEffect } from 'react';
import { discussionService } from '../../services/interactionService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface Reply {
    _id: string;
    user: { _id: string; name: string; avatar?: string; role: string };
    content: string;
    createdAt: string;
}

interface Discussion {
    _id: string;
    title: string;
    content: string;
    user: { _id: string; name: string; avatar?: string; role: string };
    replies: Reply[];
    createdAt: string;
    isResolved: boolean;
}

interface DiscussionProps {
    courseId: string;
    moduleId?: string;
    currentUser: any;
}

const CourseDiscussion: React.FC<DiscussionProps> = ({ courseId, moduleId, currentUser }) => {
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({});
    const [error, setError] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    useEffect(() => {
        fetchDiscussions();
    }, [courseId, moduleId]);

    const fetchDiscussions = async () => {
        try {
            setLoading(true);
            const data = await discussionService.getDiscussions(courseId, moduleId);
            setDiscussions(data);
        } catch (err: any) {
            console.error('Failed to load discussions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDiscussion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newContent.trim()) return;

        try {
            setIsPosting(true);
            setError('');
            const newDiscussion = await discussionService.createDiscussion(courseId, {
                title: newTitle,
                content: newContent,
                moduleId
            });
            setDiscussions([newDiscussion, ...discussions]);
            setNewTitle('');
            setNewContent('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to post discussion');
        } finally {
            setIsPosting(false);
        }
    };

    const handleReply = async (discussionId: string) => {
        const content = replyContent[discussionId];
        if (!content?.trim()) return;

        try {
            const updatedDiscussion = await discussionService.addReply(discussionId, content);
            setDiscussions(discussions.map(d => d._id === discussionId ? updatedDiscussion : d));
            setReplyContent({ ...replyContent, [discussionId]: '' });
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to post reply');
        }
    };

    const handleResolve = async (discussionId: string) => {
        try {
            const updatedDiscussion = await discussionService.resolveDiscussion(discussionId);
            setDiscussions(discussions.map(d => d._id === discussionId ? { ...d, isResolved: true } : d));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to resolve discussion');
        }
    };

    if (loading) return <div className="text-center p-4">Loading discussions...</div>;

    return (
        <div className="bg-white rounded-lg shadow mt-6 p-6">
            <h3 className="text-xl font-bold mb-6">Course Q&A</h3>

            {/* Create Discussion Form */}
            <form onSubmit={handleCreateDiscussion} className="mb-8 border-b pb-6">
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Question title..."
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <textarea
                        placeholder="Detail your question here..."
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 h-24"
                        required
                    />
                </div>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <button
                    type="submit"
                    disabled={isPosting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                >
                    {isPosting ? 'Posting...' : 'Ask Question'}
                </button>
            </form>

            {/* Discussions List */}
            <div className="space-y-6">
                {discussions.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No questions asked yet. Be the first!</p>
                ) : (
                    discussions.map((discussion) => (
                        <div key={discussion._id} className={`border rounded-lg p-5 ${discussion.isResolved ? 'bg-green-50 border-green-200' : 'bg-white'}`}>

                            {/* Discussion Header */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                        {discussion.user.avatar ?
                                            <img src={discussion.user.avatar} alt={discussion.user.name} className="w-full h-full object-cover" /> :
                                            <span className="text-gray-600 font-bold">{discussion.user.name.charAt(0)}</span>
                                        }
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">{discussion.title}</h4>
                                        <p className="text-xs text-gray-500">
                                            {discussion.user.name} • {dayjs(discussion.createdAt).fromNow()}
                                            {discussion.user.role === 'instructor' && <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">Instructor</span>}
                                        </p>
                                    </div>
                                </div>
                                {discussion.isResolved ? (
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Resolved</span>
                                ) : (
                                    // Show resolve button if user is creator or instructor/admin
                                    (currentUser?.id === discussion.user._id || currentUser?.role === 'instructor' || currentUser?.role === 'admin') && (
                                        <button
                                            onClick={() => handleResolve(discussion._id)}
                                            className="text-xs text-gray-500 hover:text-green-600 border px-2 py-1 rounded"
                                        >
                                            Mark Resolved
                                        </button>
                                    )
                                )}
                            </div>

                            {/* Discussion Body */}
                            <div className="text-gray-700 whitespace-pre-wrap ml-13 mb-4">
                                {discussion.content}
                            </div>

                            {/* Replies Section */}
                            <div className="ml-13 mt-4 space-y-4 border-t pt-4">
                                {discussion.replies.map((reply) => (
                                    <div key={reply._id} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                            {reply.user?.avatar ?
                                                <img src={reply.user.avatar} alt="avatar" className="w-full h-full object-cover" /> :
                                                <span className="text-gray-600 font-bold text-sm">{reply.user?.name?.charAt(0) || '?'}</span>
                                            }
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg flex-grow">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-medium text-sm">
                                                    {reply.user?.name || 'Unknown User'}
                                                    {reply.user?.role === 'instructor' && <span className="ml-2 text-blue-600 text-xs font-bold">Instructor</span>}
                                                </span>
                                                <span className="text-xs text-gray-500">{dayjs(reply.createdAt).fromNow()}</span>
                                            </div>
                                            <p className="text-gray-700 text-sm whitespace-pre-wrap">{reply.content}</p>
                                        </div>
                                    </div>
                                ))}

                                {/* Add Reply Input */}
                                {!discussion.isResolved && (
                                    <div className="flex gap-2 mt-3">
                                        <input
                                            type="text"
                                            placeholder="Write a reply..."
                                            value={replyContent[discussion._id] || ''}
                                            onChange={(e) => setReplyContent({ ...replyContent, [discussion._id]: e.target.value })}
                                            className="flex-grow px-3 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') handleReply(discussion._id);
                                            }}
                                        />
                                        <button
                                            onClick={() => handleReply(discussion._id)}
                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-sm font-medium"
                                        >
                                            Reply
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CourseDiscussion;
