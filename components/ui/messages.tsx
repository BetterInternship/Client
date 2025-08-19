import { Card } from "./card";

export const Message = ({
  message,
  them,
  self,
  prevSelf,
}: {
  message: string;
  them: string;
  self: boolean;
  prevSelf: boolean;
}) => {
  return !self ? (
    <div className="flex flex-col">
      {prevSelf && (
        <div className="text-xs pl-1 pb-1 text-gray-500">{them}</div>
      )}
      <Card className="py-2 px-4 w-fit text-sm w-prose max-w-full text-wrap break-words">
        {message}
      </Card>
    </div>
  ) : (
    <div className="w-full flex flex-row bg-transparent p-0">
      <div className="flex-1 bg-transparent"></div>
      <div className="flex flex-col">
        {!prevSelf && (
          <div className="text-right text-xs pr-1 pb-1 text-gray-500">you</div>
        )}
        <Card className="py-2 px-4 w-fit text-sm w-prose max-w-full text-wrap break-words bg-primary text-white">
          {message}
        </Card>
      </div>
    </div>
  );
};
