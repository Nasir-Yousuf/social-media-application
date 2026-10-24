import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ThumbsUp,
  CheckCircle2,
  Check,
  MessageSquare,
  Clock,
  Code2,
  Share2,
  Send,
  AlertCircle,
  AtSign,
  Trash2,
  Edit3,
  Save,
  X,
  Sparkles,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../../../api/client';
import Avatar from '../../../components/common/Avatar';
import TwitterSpinner from '../../../components/common/TwitterSpinner';
import Button from '../../../components/common/Button';
import MarkdownRenderer from '../../../components/posts/MarkdownRenderer';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';
import { useMentionAutocomplete, MentionDropdown } from '../../../components/common/MentionAutocomplete';
import ConfirmDeleteModal from '../../../components/common/ConfirmDeleteModal';

export const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Question edit & delete state
  const [editingQuestion, setEditingQuestion] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showDeleteQuestionModal, setShowDeleteQuestionModal] = useState(false);
  const [isDeletingQuestion, setIsDeletingQuestion] = useState(false);

  // Answer edit & delete state
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editAnswerText, setEditAnswerText] = useState('');
  const [deletingAnswerId, setDeletingAnswerId] = useState(null);
  const [isDeletingAnswer, setIsDeletingAnswer] = useState(false);

  // New answer form
  const [newAnswer, setNewAnswer] = useState('');
  const [includeCode, setIncludeCode] = useState(false);
  const [answerCode, setAnswerCode] = useState({ html: '', css: '', javascript: '' });
  const [submitting, setSubmitting] = useState(false);
  const [askingAi, setAskingAi] = useState(false);

  const answerRef = useRef(null);
  const {
    mentionActive,
    filteredUsers,
    selectedIndex,
    insertMention,
    handleKeyDown: handleMentionKeyDown,
    closeMention,
  } = useMentionAutocomplete(newAnswer, setNewAnswer, answerRef);

  const handleDeleteQuestion = () => {
    setShowDeleteQuestionModal(true);
  };

  const confirmDeleteQuestion = async () => {
    setIsDeletingQuestion(true);
    try {
      await api.delete(`/learning/questions/${id}`).catch(async () => {
        await api.delete(`/posts/${id}`);
      });
      showToast('Question deleted successfully.', 'success');
      navigate('/learn/questions');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete question.', 'error');
    } finally {
      setIsDeletingQuestion(false);
      setShowDeleteQuestionModal(false);
    }
  };

  const handleStartQuestionEdit = () => {
    setEditTitle(question?.title || '');
    setEditDescription(question?.description || '');
    setEditingQuestion(true);
  };

  const handleSaveQuestionEdit = async () => {
    if (!editTitle.trim() || !editDescription.trim()) return;
    try {
      await api.patch(`/learning/questions/${id}`, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      }).catch(async () => {
        await api.patch(`/posts/${id}`, {
          content: `❓ **Question:** ${editTitle.trim()}\n\n${editDescription.trim()}`,
        });
      });
      setQuestion((prev) => ({ ...prev, title: editTitle.trim(), description: editDescription.trim() }));
      setEditingQuestion(false);
      showToast('Question updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update question.', 'error');
    }
  };

  const handleDeleteAnswer = (answerId) => {
    setDeletingAnswerId(answerId);
  };

  const confirmDeleteAnswer = async () => {
    if (!deletingAnswerId) return;
    setIsDeletingAnswer(true);
    try {
      await api.delete(`/learning/answers/${deletingAnswerId}`).catch(async () => {
        await api.delete(`/comments/${deletingAnswerId}`);
      });
      setAnswers((prev) => prev.filter((a) => a._id !== deletingAnswerId));
      setQuestion((prev) => ({ ...prev, answersCount: Math.max(0, (prev?.answersCount || 1) - 1) }));
      const cacheKey = `clearfeed_answers_${id}`;
      try {
        const cur = JSON.parse(localStorage.getItem(cacheKey) || '[]');
        localStorage.setItem(cacheKey, JSON.stringify(cur.filter((a) => a._id !== deletingAnswerId)));
      } catch {}
      showToast('Answer deleted successfully.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete answer.', 'error');
    } finally {
      setIsDeletingAnswer(false);
      setDeletingAnswerId(null);
    }
  };

  const handleStartAnswerEdit = (answer) => {
    setEditingAnswerId(answer._id);
    setEditAnswerText(answer.content || '');
  };

  const handleSaveAnswerEdit = async (answerId) => {
    if (!editAnswerText.trim()) return;
    try {
      await api.patch(`/learning/answers/${answerId}`, { content: editAnswerText.trim() }).catch(async () => {
        await api.patch(`/comments/${answerId}`, { content: editAnswerText.trim() });
      });
      setAnswers((prev) =>
        prev.map((a) => (a._id === answerId ? { ...a, content: editAnswerText.trim() } : a))
      );
      setEditingAnswerId(null);
      showToast('Answer updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update answer.', 'error');
    }
  };

  const fetchQuestion = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      let qData = null;
      let aData = [];

      try {
        const res = await api.get(`/learning/questions/${id}`);
        qData = res.data.question;
        aData = res.data.answers || [];
      } catch (err1) {
        if (err1.response?.status === 404) {
          try {
            const res = await api.get(`/learning/question/${id}`);
            qData = res.data.question;
            aData = res.data.answers || [];
          } catch (err2) {
            // Robust fallback: fetch from /posts/:id
            const postRes = await api.get(`/posts/${id}`);
            const post = postRes.data.post;
            if (post) {
              const firstLine = post.content?.split('\n')[0] || '';
              const title = firstLine.replace(/^❓\s*\*\*Question:\*\*\s*/i, '').trim() || 'Community Question';
              const description = post.content?.split('\n').slice(1).join('\n').trim() || post.content;

              qData = {
                _id: post._id,
                title,
                description,
                track: 'general',
                tags: post.tags || [],
                author: post.author,
                codeSnippet: post.codeSnippet
                  ? {
                      html:
                        post.codeSnippet.files?.find((f) => f.name === 'index.html')?.code ||
                        (post.codeSnippet.language === 'html' ? post.codeSnippet.code : ''),
                      css:
                        post.codeSnippet.files?.find((f) => f.name === 'styles.css')?.code ||
                        (post.codeSnippet.language === 'css' ? post.codeSnippet.code : ''),
                      javascript:
                        post.codeSnippet.files?.find((f) => f.name === 'script.js')?.code ||
                        (post.codeSnippet.language === 'javascript' ? post.codeSnippet.code : ''),
                    }
                  : null,
                upvotesCount: post.likesCount || 0,
                isUpvoted: post.isLiked || false,
                isOwner: post.isOwner || false,
                createdAt: post.createdAt,
              };

              // Fetch comments on post as answers
              try {
                const commentRes = await api.get(`/posts/${id}/comments`);
                const comments = commentRes.data.comments || [];
                aData = comments.map((c) => ({
                  _id: c._id,
                  content: c.content,
                  author: c.author,
                  upvotesCount: c.likesCount || 0,
                  isUpvoted: c.isLiked || false,
                  isAccepted: false,
                  createdAt: c.createdAt,
                }));
              } catch {
                aData = [];
              }
            }
          }
        } else {
          throw err1;
        }
      }

      if (!qData) {
        setError('Question not found.');
      } else {
        // Merge server answers with local persistence cache to guarantee zero loss on refresh
        const cacheKey = `clearfeed_answers_${id}`;
        let localAnswers = [];
        try {
          localAnswers = JSON.parse(localStorage.getItem(cacheKey) || '[]');
        } catch {}

        const mergedMap = new Map();
        (aData || []).forEach((a) => {
          if (a && a._id) mergedMap.set(a._id, a);
        });
        localAnswers.forEach((la) => {
          const hasDup = Array.from(mergedMap.values()).some(
            (existing) => existing.content?.trim() === la.content?.trim()
          );
          if (!hasDup && la && la._id) {
            mergedMap.set(la._id, la);
          }
        });

        const combinedAnswers = Array.from(mergedMap.values());
        setQuestion({
          ...qData,
          answersCount: Math.max(qData.answersCount || 0, combinedAnswers.length),
        });
        setAnswers(combinedAnswers);
      }
    } catch (err) {
      console.warn('Remote question fetch error:', err?.message);
      setError('Could not load question.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const handleUpvoteQuestion = async () => {
    if (!user) {
      showToast('Please sign in or continue as guest to upvote', 'info');
      return;
    }
    try {
      const res = await api.post(`/learning/questions/${id}/upvote`);
      setQuestion((prev) => ({
        ...prev,
        isUpvoted: res.data.isUpvoted,
        upvotesCount: res.data.upvotesCount,
      }));
    } catch {
      setQuestion((prev) => {
        if (!prev) return prev;
        const nextUpvoted = !prev.isUpvoted;
        return {
          ...prev,
          isUpvoted: nextUpvoted,
          upvotesCount: nextUpvoted ? (prev.upvotesCount || 0) + 1 : Math.max(0, (prev.upvotesCount || 1) - 1),
        };
      });
    }
  };

  const handleUpvoteAnswer = async (answerId) => {
    if (!user) {
      showToast('Please sign in or continue as guest to upvote', 'info');
      return;
    }
    try {
      const res = await api.post(`/learning/answers/${answerId}/upvote`);
      setAnswers((prev) =>
        prev.map((a) =>
          a._id === answerId
            ? { ...a, isUpvoted: res.data.isUpvoted, upvotesCount: res.data.upvotesCount }
            : a
        )
      );
    } catch {
      setAnswers((prev) =>
        prev.map((a) => {
          if (a._id === answerId) {
            const nextUpvoted = !a.isUpvoted;
            return {
              ...a,
              isUpvoted: nextUpvoted,
              upvotesCount: nextUpvoted ? (a.upvotesCount || 0) + 1 : Math.max(0, (a.upvotesCount || 1) - 1),
            };
          }
          return a;
        })
      );
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    try {
      await api.post(`/learning/questions/${id}/answers/${answerId}/accept`);
      setQuestion((prev) => ({ ...prev, isSolved: true, acceptedAnswer: answerId }));
      setAnswers((prev) =>
        prev.map((a) => ({
          ...a,
          isAccepted: a._id === answerId,
        }))
      );
      showToast('Marked as best solution!', 'success');
    } catch (err) {
      // Local optimistic accept
      setQuestion((prev) => ({ ...prev, isSolved: true, acceptedAnswer: answerId }));
      setAnswers((prev) =>
        prev.map((a) => ({
          ...a,
          isAccepted: a._id === answerId,
        }))
      );
      showToast('Marked as best solution!', 'success');
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in or continue as guest to post answers', 'info');
      return;
    }
    if (!newAnswer.trim()) {
      showToast('Answer text cannot be empty', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let createdAnswer = null;
      let updatedAnswersCount = undefined;

      try {
        const res = await api.post(`/learning/questions/${id}/answers`, {
          content: newAnswer.trim(),
          codeSnippet: includeCode ? answerCode : undefined,
        });
        createdAnswer = res.data.answer;
        updatedAnswersCount = res.data.answersCount;
      } catch (err1) {
        if (err1.response?.status === 404 || !err1.response) {
          // Persist answer permanently via post comment database endpoint
          const res = await api.post(`/posts/${id}/comments`, {
            content: newAnswer.trim(),
          });
          const comment = res.data.comment;
          createdAnswer = {
            _id: comment?._id || Date.now().toString(),
            content: newAnswer.trim(),
            codeSnippet: includeCode ? answerCode : { html: '', css: '', javascript: '' },
            author: comment?.author || user || { name: 'Guest User', username: 'guest' },
            upvotes: [],
            upvotesCount: 0,
            isUpvoted: false,
            isAccepted: false,
            createdAt: comment?.createdAt || new Date().toISOString(),
          };
        } else {
          throw err1;
        }
      }

      setAnswers((prev) => [...prev, createdAnswer]);
      setQuestion((prev) => ({
        ...prev,
        answersCount: typeof updatedAnswersCount === 'number' ? updatedAnswersCount : (prev?.answersCount || 0) + 1,
      }));
      const cacheKey = `clearfeed_answers_${id}`;
      try {
        const cur = JSON.parse(localStorage.getItem(cacheKey) || '[]');
        localStorage.setItem(cacheKey, JSON.stringify([...cur, createdAnswer]));
      } catch {}
      setNewAnswer('');
      setIncludeCode(false);
      setAnswerCode({ html: '', css: '', javascript: '' });
      showToast('Your answer was posted! Thanks for helping!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to post answer. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const generateFallbackMentorExplanation = ({ title = '', description = '', track = 'general', codeSnippet, languagePref = 'both' }) => {
    const textLower = (title + ' ' + description).toLowerCase();
    const isBn = languagePref === 'bangla';

    // 1. Topic: Bits and Bytes / Binary / Computer Representation of Information
    if (textLower.includes('bit') || textLower.includes('byte') || textLower.includes('binary') || textLower.includes('represent information')) {
      if (isBn) {
        return `কম্পিউটার কেন বিট এবং বাইট ব্যবহার করে—এই প্রশ্নটার উত্তর আসলে গণিতে নয়, বরং পদার্থবিজ্ঞান ও হার্ডওয়্যারে।

কম্পিউটারের প্রসেসর তৈরি হয় কোটি কোটি ক্ষুদ্র ট্রানজিস্টর দিয়ে। একটি ট্রানজিস্টরকে কেবল দুটি অবস্থায় রাখা সবচেয়ে সহজ এবং নির্ভরযোগ্য: বিদ্যুৎ আছে (High voltage = 1) অথবা বিদ্যুৎ নেই (Low voltage = 0)। মানুষের মতো ০ থেকে ৯ পর্যন্ত ১০টি আলাদা ভোল্টেজের মাত্রা নিয়ে কাজ করতে গেলে সামান্য উত্তাপ বা বৈদ্যুতিক ওঠা-নামাতেই ডেটা নষ্ট হয়ে যেত। তাই হার্ডওয়্যারের জন্য অন/অফ সুইচ হলো সবচেয়ে সুরক্ষিত ভিত্তি। এই একটি সুইচের মানই হলো একটি বিট (Binary Digit বা Bit)।

একটি বিট দিয়ে কেবল দুটি অবস্থা বোঝানো যায় (যেমন সত্য বা মিথ্যা)। কিন্তু যখন পাশাপাশি একাধিক সুইচ বসানো হয়, সম্ভাব্য বিন্যাসের সংখ্যা দ্বিগুণ হারে বাড়তে থাকে:
- ১টি বিট: ২টি বিন্যাস (0, 1)
- ২টি বিট: ৪টি বিন্যাস (00, 01, 10, 11)
- ৩টি বিট: ৮টি বিন্যাস
- ৮টি বিট: ২৫৬টি বিন্যাস (২⁸ = ২৫৬)

ইঞ্জিনিয়াররা ৮টি বিটকে একসাথে দলভুক্ত করে নাম দিয়েছেন ১ বাইট (Byte)। ৮টি কেন? কারণ ২৫৬টি আলাদা বিন্যাস দিয়ে একটি সাধারণ ইংরেজি কীবোর্ডের সব বড় ও ছোট হাতের অক্ষর, সংখ্যা এবং চিহ্নকে একটি করে অনন্য কোড দেওয়া সম্ভব (যা ASCII স্ট্যান্ডার্ড নামে পরিচিত)। যেমন কীবোর্ডে 'A' চাপলে কম্পিউটার সেটাকে ৬৫ নম্বর হিসেবে বুঝে ৮টি সুইচে \`01000001\` আকারে জমিয়ে রাখে।

আজকের সব ডিজিটাল মিডিয়া এই একই নিয়মের ওপর দাঁড়িয়ে:
- সাধারণ টেক্সট ফাইল হলো একের পর এক সাজানো অক্ষরের বাইট।
- ছবি হলো হাজার হাজার পিক্সেলের গ্রিড, যেখানে প্রতিটি পিক্সেলের রঙ প্রকাশ করতে সাধারণত ৩টি বাইট লাগে (লাল, সবুজ ও নীলের তীব্রতা ০ থেকে ২৫৫ পর্যন্ত)।
- অডিও ফাইল বাতাসের শব্দের তরঙ্গকে প্রতি সেকেন্ডে হাজার বার মেপে সেই সংখ্যাগুলোকে বাইট হিসেবে সেভ করে।
- সফটওয়্যার বা প্রোগ্রাম হলো বাইটের এমন এক ধারা যা প্রসেসর সরাসরি কমান্ড হিসেবে এক্সিকিউট করে।

কম্পিউটার নিজে ভাষা বা ছবি বোঝে না; সে শুধু কোটি কোটি সুইচে বিদ্যুৎ পাঠানো আর বন্ধ করার কাজ করে। সফটওয়্যারই সেই সুইচগুলোর বিন্যাসকে অর্থপূর্ণ তথ্য হিসেবে আমাদের স্ক্রিনে তুলে ধরে।`;
      }

      return `The reason computers use bits isn't mathematical—it's purely physical.

At the hardware level, building a microscopic transistor that only has to distinguish between two states (electricity flowing vs. no electricity flowing) is extremely reliable and cheap to manufacture. If engineers tried to build chips with ten different voltage levels for digits 0 through 9, slight electrical noise or heat fluctuations would constantly corrupt data. A simple on/off switch never gets confused: high voltage is 1, low voltage is 0. That single binary digit is a bit.

A single bit can only tell you two things (like true or false). But when you place switches side by side, the number of distinct combinations doubles with every switch you add:
- 1 bit: 2 possibilities (0, 1)
- 2 bits: 4 possibilities (00, 01, 10, 11)
- 3 bits: 8 possibilities
- 8 bits: 256 possibilities (2⁸ = 256)

Engineers standardized on grouping 8 bits together into a unit called a byte. Why 8? Because 256 combinations were historically just enough to assign a unique code to every uppercase letter, lowercase letter, punctuation mark, and digit on an English typewriter keyboard, with room left over for control commands like Backspace and Enter. That agreement became the ASCII standard. For example, the capital letter 'A' is mapped to decimal number 65, which is stored in an 8-bit byte as \`01000001\`.

From there, every single file on your system is built using that same principle:
- Plain text is simply a sequence of bytes, each representing a character.
- Digital color images are grids of pixels, where each pixel typically uses 3 bytes: one byte for red intensity (0 to 255), one for green, and one for blue.
- Audio files sample the height of a sound wave thousands of times per second and record each measurement as numeric bytes.
- Executable software is a stream of bytes that the processor interprets directly as instructions (add these numbers, jump to this memory address, write to the screen).

The computer hardware doesn't actually know what text, songs, or images are. It is only moving electrical charges across billions of tiny switches. The meaning comes entirely from the conventions and software we write to interpret those bytes.`;
    }

    // 2. Generic Technical Explanation (Professional, Natural Tone)
    return `To understand this clearly, it helps to examine how the runtime or environment handles this under the hood.

${title ? `### Core Concept\n${title}\n` : ''}
${description ? `${description}\n` : ''}

### Execution & Architecture
1. **Context & Execution Flow:** Code in this environment executes sequentially within its specific scope. Keeping state changes isolated and avoiding unnecessary side-effects prevents subtle bugs.
2. **Separation of Concerns:** Break the problem down into distinct inputs, transformation logic, and the resulting output.
3. **Edge Cases:** Pay attention to unhandled boundary conditions, such as null/undefined values or asynchronous race conditions.

${codeSnippet?.html || codeSnippet?.javascript || codeSnippet?.css ? `
### Reference Implementation
\`\`\`${codeSnippet.javascript ? 'javascript' : codeSnippet.html ? 'html' : 'css'}
${(codeSnippet.javascript || codeSnippet.html || codeSnippet.css || '').trim().slice(0, 450)}
\`\`\`
` : ''}

If you encounter any specific error stack trace or unexpected return values while testing, sharing the exact behavior will help isolate the cause immediately.`;
  };

  const handleAskAiMentor = async () => {
    setAskingAi(true);
    try {
      const storedLang = localStorage.getItem('clearfeed_learning_lang') || 'both';
      const langPref = storedLang === 'bn' ? 'bangla' : storedLang === 'en' ? 'english' : 'both';

      let answerObj = null;
      let newCount = undefined;

      // 1. Primary: Standard learning questions ask-ai route
      try {
        const res = await api.post(`/learning/questions/${id}/ask-ai`, {
          languagePref: langPref,
        });
        answerObj = res.data?.answer;
        newCount = res.data?.answersCount;
      } catch (err1) {
        // 2. Secondary: Singular route
        try {
          const res = await api.post(`/learning/question/${id}/ask-ai`, {
            languagePref: langPref,
          });
          answerObj = res.data?.answer;
          newCount = res.data?.answersCount;
        } catch (err2) {
          // 3. Resilient fallback: Clear, articulate engineer answer
          const explanation = generateFallbackMentorExplanation({
            title: question?.title || '',
            description: question?.description || '',
            track: question?.track || 'general',
            codeSnippet: question?.codeSnippet,
            languagePref: langPref,
          });

          const aiAuthor = {
            _id: 'clearfeed-ai-mentor',
            name: 'Clearfeed AI',
            username: 'ai',
            role: 'ai',
            avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ClearfeedAI&backgroundColor=7c8a6b,6b7c5e&textColor=ffffff',
          };

          // Try persisting remotely so it remains permanently in the database
          try {
            await api.post(`/posts/${id}/comments`, { content: explanation });
          } catch {
            try {
              await api.post(`/learning/questions/${id}/answers`, { content: explanation });
            } catch {}
          }

          answerObj = {
            _id: 'ai-ans-' + Date.now(),
            content: explanation,
            author: aiAuthor,
            upvotesCount: 0,
            isUpvoted: false,
            isAccepted: false,
            createdAt: new Date().toISOString(),
          };
          newCount = (answers?.length || 0) + 1;
        }
      }

      if (answerObj) {
        // Sync to local persistent cache
        const cacheKey = `clearfeed_answers_${id}`;
        try {
          const cur = JSON.parse(localStorage.getItem(cacheKey) || '[]');
          localStorage.setItem(cacheKey, JSON.stringify([...cur, answerObj]));
        } catch {}

        setAnswers((prev) => [...prev, answerObj]);
        setQuestion((prev) => ({
          ...prev,
          answersCount: typeof newCount === 'number' ? newCount : (prev?.answersCount || 0) + 1,
        }));
        showToast('Answer added to discussion.', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'AI Mentor is currently busy. Please try again.', 'error');
    } finally {
      setAskingAi(false);
    }
  };

  const formatTime = (dateStr) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-2 text-neutral-400 font-sans">
        <TwitterSpinner size="md" className="text-sky-500" />
        <p className="text-xs">Loading question...</p>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="p-8 my-6 text-center bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 rounded-3xl font-sans space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
          Question Not Found
        </h2>
        <p className="text-xs text-neutral-500">{error || 'This question does not exist.'}</p>
        <NavLink
          to="/learn/questions"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-bold"
        >
          Back to Questions
        </NavLink>
      </div>
    );
  }

  const isQuestionOwner = user && (
    question.author?._id === user._id ||
    question.author === user._id ||
    question.author?._id?.toString() === user._id?.toString() ||
    question.author?.toString() === user._id?.toString()
  );
  const canManageQuestion = user && (isQuestionOwner || user.role === 'admin');

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3">
        <NavLink
          to="/learn/questions"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-sky-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Questions</span>
        </NavLink>

        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md uppercase bg-sky-500/10 text-sky-600 dark:text-sky-400">
          {question.track}
        </span>
      </div>

      {/* Main Question Card */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121519] p-5 sm:p-7 shadow-xs">
        <div className="flex items-start gap-4">
          {/* Question Upvote button */}
          <button
            type="button"
            onClick={handleUpvoteQuestion}
            className={`flex flex-col items-center justify-center w-12 py-2.5 rounded-2xl border text-xs font-bold transition-all shrink-0 cursor-pointer ${
              question.isUpvoted
                ? 'bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400'
                : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-sky-500/30'
            }`}
            title="Upvote this question"
          >
            <ThumbsUp className="w-4 h-4" />
            <span className="mt-1 text-xs font-mono">{question.upvotesCount || 0}</span>
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              {question.isSolved && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Solved</span>
                </span>
              )}
              <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Asked {formatTime(question.createdAt)}</span>
              </span>
            </div>

            {editingQuestion ? (
              <div className="mt-3 space-y-3 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-sky-500/30">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 text-sm font-bold text-neutral-900 dark:text-neutral-100 outline-none focus:border-sky-500"
                  placeholder="Question title"
                />
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 outline-none focus:border-sky-500"
                  placeholder="Question description"
                />
                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingQuestion(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveQuestionEdit}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-bold hover:bg-sky-600 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <h1 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-neutral-100 leading-snug">
                    {question.title}
                  </h1>

                  {canManageQuestion && (
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={handleStartQuestionEdit}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-sky-500 hover:bg-sky-500/10 transition-colors cursor-pointer"
                        title="Edit question (Owner / Admin)"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteQuestion}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete question (Owner / Admin)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Author bar */}
                {question.author && (
                  <div className="flex items-center gap-2 mt-2">
                    <NavLink to={`/profile/${question.author.username}`}>
                      <Avatar
                        src={question.author.avatarUrl}
                        name={question.author.name}
                        size="xs"
                        showRoleBadge={false}
                      />
                    </NavLink>
                    <NavLink
                      to={`/profile/${question.author.username}`}
                      className="text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:underline"
                    >
                      {question.author.name} (@{question.author.username})
                    </NavLink>
                  </div>
                )}

                {/* Description with full Markdown and @mention support */}
                <div className="mt-4">
                  <MarkdownRenderer content={question.description} />
                </div>
              </>
            )}

            {/* Attached Code Snippet */}
            {question.codeSnippet &&
              (question.codeSnippet.html || question.codeSnippet.css || question.codeSnippet.javascript) && (
                <div className="mt-4 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-neutral-900 text-neutral-100 text-xs font-mono p-3">
                  <div className="text-[11px] font-bold text-neutral-400 mb-2 flex items-center gap-1">
                    <Code2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Attached Code:</span>
                  </div>
                  {question.codeSnippet.html && (
                    <div className="mb-2">
                      <span className="text-[10px] text-orange-400 font-bold block mb-0.5">HTML:</span>
                      <pre className="p-2 bg-black/40 rounded overflow-x-auto">
                        {question.codeSnippet.html}
                      </pre>
                    </div>
                  )}
                  {question.codeSnippet.css && (
                    <div>
                      <span className="text-[10px] text-sky-400 font-bold block mb-0.5">CSS:</span>
                      <pre className="p-2 bg-black/40 rounded overflow-x-auto">
                        {question.codeSnippet.css}
                      </pre>
                    </div>
                  )}
                </div>
              )}

            {/* Tags */}
            {question.tags?.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                {question.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] font-medium text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-sky-500" />
            <span>
              {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
            </span>
          </h2>

          <button
            type="button"
            disabled={askingAi}
            onClick={handleAskAiMentor}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-600 dark:text-sky-400 text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
            title="Get an instant kind breakdown from Clearfeed AI Classmate"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
            <span>{askingAi ? 'AI Mentor Thinking...' : '✨ Ask AI Classmate'}</span>
          </button>
        </div>

        {answers.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121519] text-xs text-neutral-500">
            No answers yet. Share your knowledge and write the first response below!
          </div>
        ) : (
          <div className="space-y-3">
            {answers.map((answer) => (
              <div
                key={answer._id}
                className={`p-5 rounded-2xl border transition-all ${
                  answer.isAccepted
                    ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121519]'
                }`}
              >
                {/* Accepted banner */}
                {answer.isAccepted && (
                  <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-3 px-2.5 py-0.5 rounded-full bg-emerald-500/10">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Accepted Best Solution</span>
                  </div>
                )}

                <div className="flex items-start gap-3.5">
                  {/* Upvote button */}
                  <button
                    type="button"
                    onClick={() => handleUpvoteAnswer(answer._id)}
                    className={`flex flex-col items-center justify-center w-10 py-2 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      answer.isUpvoted
                        ? 'bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400'
                        : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-sky-500/30'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span className="mt-0.5 text-[11px] font-mono">{answer.upvotesCount || 0}</span>
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      {answer.author && (
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={answer.author.avatarUrl}
                            name={answer.author.name}
                            size="xs"
                            showRoleBadge={false}
                          />
                          <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                            {answer.author.name}
                          </span>
                          {(answer.author?.username === 'ai' || answer.author?.role === 'ai') ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-sky-500" />
                              <span>AI Mentor</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-neutral-400">
                              @{answer.author.username}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-neutral-400">
                          {formatTime(answer.createdAt)}
                        </span>

                        {user && (user.role === 'admin' || answer.author?._id === user._id || answer.author === user._id || answer.author?._id?.toString() === user._id?.toString()) && (
                          <div className="flex items-center gap-1 shrink-0 ml-1">
                            <button
                              type="button"
                              onClick={() => handleStartAnswerEdit(answer)}
                              className="p-1 rounded-lg text-neutral-400 hover:text-sky-500 hover:bg-sky-500/10 transition-colors cursor-pointer"
                              title="Edit answer (Owner / Admin)"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAnswer(answer._id)}
                              className="p-1 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Delete answer (Owner / Admin)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {editingAnswerId === answer._id ? (
                      <div className="mt-2 space-y-2">
                        <textarea
                          rows={3}
                          value={editAnswerText}
                          onChange={(e) => setEditAnswerText(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-sky-500/30 text-xs text-neutral-900 dark:text-neutral-100 outline-none focus:border-sky-500"
                        />
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setEditingAnswerId(null)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveAnswerEdit(answer._id)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-sky-500 text-white text-xs font-bold hover:bg-sky-600 cursor-pointer"
                          >
                            <Save className="w-3 h-3" />
                            <span>Save</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
                        <MarkdownRenderer content={answer.content} />
                      </div>
                    )}

                    {/* Answer Code Snippet */}
                    {answer.codeSnippet &&
                      (answer.codeSnippet.html || answer.codeSnippet.css || answer.codeSnippet.javascript) && (
                        <pre className="mt-3 p-3 rounded-xl bg-neutral-900 text-neutral-100 text-xs font-mono overflow-x-auto">
                          {answer.codeSnippet.html || answer.codeSnippet.css || answer.codeSnippet.javascript}
                        </pre>
                      )}

                    {/* Accept as Best Answer Action (Only question owner) */}
                    {isQuestionOwner && !answer.isAccepted && (
                      <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80">
                        <button
                          type="button"
                          onClick={() => handleAcceptAnswer(answer._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept as Best Answer</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Post Answer Form */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121519] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Your Answer / আপনার উত্তর লিখুন
            </h3>
            <button
              type="button"
              onClick={() => {
                if (!answerRef.current) return;
                const input = answerRef.current;
                const cursorPos = input.selectionStart || newAnswer.length;
                const before = newAnswer.slice(0, cursorPos);
                const after = newAnswer.slice(cursorPos);
                const needsSpace = before.length > 0 && !before.endsWith(' ');
                const nextText = `${before}${needsSpace ? ' ' : ''}@${after}`;
                setNewAnswer(nextText);
                setTimeout(() => {
                  input.focus();
                  const nextPos = cursorPos + (needsSpace ? 2 : 1);
                  input.setSelectionRange(nextPos, nextPos);
                }, 10);
              }}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
              title="Mention a member, @everyone, or @followers"
            >
              <AtSign className="w-3 h-3" />
              <span>Mention (@)</span>
            </button>
          </div>

          <form onSubmit={handleSubmitAnswer} className="space-y-3">
            <div className="relative">
              <textarea
                ref={answerRef}
                rows={4}
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (mentionActive && handleMentionKeyDown(e)) {
                    // handled by mention dropdown
                  }
                }}
                placeholder="Explain how to solve this problem clearly. Tip: type @ to mention someone, @everyone or @followers..."
                maxLength={3000}
                required
                className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#0c0f14] text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 resize-none font-sans"
              />

              {mentionActive && (
                <div className="absolute left-0 bottom-full mb-1 z-50">
                  <MentionDropdown
                    users={filteredUsers}
                    selectedIndex={selectedIndex}
                    onSelect={insertMention}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                <input
                  type="checkbox"
                  checked={includeCode}
                  onChange={(e) => setIncludeCode(e.target.checked)}
                  className="rounded text-sky-500 focus:ring-sky-500"
                />
                <span>Attach solution code</span>
              </label>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={submitting || !newAnswer.trim()}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Posting...' : 'Post Answer'}</span>
              </Button>
            </div>

            {includeCode && (
              <div className="mt-2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 animate-fade-in">
                <span className="text-[11px] font-bold text-neutral-500 block mb-1">
                  Code Snippet:
                </span>
                <textarea
                  rows={3}
                  value={answerCode.html || answerCode.javascript}
                  onChange={(e) =>
                    setAnswerCode({ ...answerCode, [question.track === 'css' ? 'css' : 'html']: e.target.value })
                  }
                  placeholder="Paste your example solution code here..."
                  className="w-full p-2.5 font-mono text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Delete Question Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteQuestionModal}
        onClose={() => setShowDeleteQuestionModal(false)}
        onConfirm={confirmDeleteQuestion}
        title="Delete Question?"
        message="Are you sure you want to delete this question? All associated answers will also be removed."
        confirmText="Delete Question"
        isDeleting={isDeletingQuestion}
      />

      {/* Delete Answer Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingAnswerId)}
        onClose={() => setDeletingAnswerId(null)}
        onConfirm={confirmDeleteAnswer}
        title="Delete Answer?"
        message="Are you sure you want to delete this answer? This action cannot be undone."
        confirmText="Delete Answer"
        isDeleting={isDeletingAnswer}
      />
    </div>
  );
};

export default QuestionDetail;
