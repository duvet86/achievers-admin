export function EditorQuestions() {
  return (
    <div className="hidden w-1/4 text-pretty border bg-slate-100 p-2 sm:block">
      <p className="font-semibold">Have you answered these questions?</p>
      <hr className="my-2" />
      <ul className="list-inside list-disc p-2" data-testid="questions">
        <li>What work did you cover this week?</li>
        <li>What went well?</li>
        <li>What could be improved on?</li>
        <li>Any notes for next week for your partner mentor?</li>
        <li>Any notes for your Chapter Coordinator?</li>
      </ul>
    </div>
  );
}
