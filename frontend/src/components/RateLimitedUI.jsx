import { ZapIcon } from "lucide-react";

const RateLimitedUI = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-xl shadow-md overflow-hidden">
        <div className="flex flex-col md:flex-row items-center p-6 gap-5">
          {/* Icon */}
          <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900/50 p-4 rounded-full">
            <ZapIcon className="size-8 text-yellow-600 dark:text-yellow-500" />
          </div>
          
          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Rate Limit Reached
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-1">
              You've made too many requests in a short period. Please wait a moment.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Try again in a few seconds for the best experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateLimitedUI;