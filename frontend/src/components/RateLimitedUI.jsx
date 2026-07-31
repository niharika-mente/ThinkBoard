import { ZapIcon, RotateCcw } from "lucide-react";

const RateLimitedUI = ({ onRetry }) => {
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

          {/* Action */}
          {onRetry && (
            <div className="flex-shrink-0 w-full md:w-auto flex justify-center md:justify-start">
              <button
                onClick={onRetry}
                className="group flex items-center justify-center gap-2 px-5 py-2.5 bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 text-white font-semibold rounded-lg shadow-sm transition duration-150 ease-in-out cursor-pointer text-sm"
              >
                <RotateCcw className="size-4 transition-transform duration-500 ease-out group-hover:rotate-180" />
                Retry Now
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default RateLimitedUI;