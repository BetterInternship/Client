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
    <div className="flex flex-col max-w-[80%]">
      {prevSelf && (
        <div className="text-xs pl-1 pb-1 text-gray-500">{them}</div>
      )}
      <Card className="py-2 px-4 break-all text-sm w-prose max-w-full text-wrap">
        {message}
      </Card>
    </div>
  ) : (
    <div className="flex flex-col items-end max-w-[80%] ml-auto">
      {!prevSelf && (
        <div className="text-right text-xs pr-1 pb-1 text-gray-500">You</div>
      )}
      <Card className="py-2 px-4 text-sm break-all bg-primary text-white text-wrap">
        {message}
      </Card>
    </div>
  );
};
