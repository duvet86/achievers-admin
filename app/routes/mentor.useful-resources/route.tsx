import { SubTitle, Title } from "~/components";

export default function Index() {
  return (
    <>
      <Title>Useful resources</Title>

      <SubTitle>Educational Tools</SubTitle>

      <ul className="list-inside list-disc">
        <li>
          <a
            className="link"
            href="https://au.ixl.com/"
            target="_blank"
            rel="noreferrer"
          >
            IXL
          </a>
        </li>
        <li>
          <a
            className="link"
            href="https://www.readworks.org/"
            target="_blank"
            rel="noreferrer"
          >
            Readworks
          </a>
        </li>
        <li>
          <a
            className="link"
            href="https://senior-secondary.scsa.wa.edu.au/assessment/olna/practice-and-example-tests"
            target="_blank"
            rel="noreferrer"
          >
            OLNA
          </a>
        </li>
        <li>
          <a
            className="link"
            href="https://www.khanacademy.org"
            target="_blank"
            rel="noreferrer"
          >
            Khan Academy
          </a>
        </li>
        <li>
          <a
            className="link"
            href="https://brilliant.org/"
            target="_blank"
            rel="noreferrer"
          >
            Brilliant
          </a>
        </li>
        <li>
          <a
            className="link"
            href="https://futureyouaustralia.com.au/resources"
            target="_blank"
            rel="noreferrer"
          >
            Future You
          </a>
        </li>
        <li>
          <a
            className="link"
            href="https://www.esafety.gov.au/young-people"
            target="_blank"
            rel="noreferrer"
          >
            eSafety
          </a>
        </li>
      </ul>

      <SubTitle>Career Tools</SubTitle>

      <ul className="list-inside list-disc">
        <li>
          <a
            className="link"
            href="https://www.yourcareer.gov.au/"
            target="_blank"
            rel="noreferrer"
          >
            Your Career
          </a>
        </li>
        <li>
          <a
            className="link"
            href="https://myfuture.edu.au/home"
            target="_blank"
            rel="noreferrer"
          >
            Myfuture
          </a>
        </li>
        <li>
          <a
            className="link"
            href="https://www.16personalities.com/"
            target="_blank"
            rel="noreferrer"
          >
            16 Personalities
          </a>
        </li>
        <li>
          <a
            className="link"
            href="https://www.seek.com.au/"
            target="_blank"
            rel="noreferrer"
          >
            Seek
          </a>
        </li>
        <li>
          <a
            className="link"
            href="https://www.linkedin.com/"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
        </li>
      </ul>
    </>
  );
}
