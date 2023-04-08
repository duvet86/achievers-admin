import { render, screen } from "@testing-library/react";
import { unstable_createRemixStub } from "@remix-run/testing";

import { json } from "@remix-run/node";

import Page from "./index";

// it("renders a route", () => {
//   let RemixStub = unstable_createRemixStub([
//     {
//       path: "/",
//       element: <div>HOME</div>,
//     },
//   ]);

//   render(<RemixStub />);

//   expect(screen.getByText("HOME")).toBeInTheDocument();
// });

// test("renders a nested route", () => {
//   let RemixStub = unstable_createRemixStub([
//     {
//       element: (
//         <div>
//           <h1>ROOT</h1>
//           <Outlet />
//         </div>
//       ),
//       children: [
//         {
//           path: "/",
//           element: <div>INDEX</div>,
//         },
//       ],
//     },
//   ]);

//   render(<RemixStub />);

//   expect(screen.getByText("ROOT")).toBeInTheDocument();
//   expect(screen.getByText("INDEX")).toBeInTheDocument();
// });

it("loaders work", async () => {
  // function App() {
  //   let data = useLoaderData();
  //   return <pre data-testid="data">Message: {data.message}</pre>;
  // }

  let RemixStub = unstable_createRemixStub([
    {
      path: "/",
      // index: true,
      element: <Page />,
      // children: [],
      loader() {
        return json({});
      },
      // loader() {
      //   return json({
      //     users: [
      //       {
      //         id: 1,
      //         azureADId: null,
      //         email: "",
      //         firstName: "",
      //         lastName: "",
      //         mobile: "",
      //         addressStreet: "",
      //         addressSuburb: "",
      //         addressState: "",
      //         addressPostcode: "",
      //         additionalEmail: null,
      //         dateOfBirth: null,
      //         emergencyContactName: null,
      //         emergencyContactNumber: null,
      //         emergencyContactAddress: null,
      //         emergencyContactRelationship: null,
      //         nextOfKinName: null,
      //         nextOfKinNumber: null,
      //         nextOfKinAddress: null,
      //         nextOfKinRelationship: null,
      //         profilePicturePath: null,
      //         hasApprovedToPublishPhotos: null,
      //         endDate: null,
      //         createdAt: new Date(),
      //         updatedAt: new Date(),
      //         chapterId: "",
      //         chapter: {
      //           id: "",
      //           name: "",
      //           address: "",
      //           createdAt: new Date(),
      //           updatedAt: new Date(),
      //         },
      //       },
      //     ],
      //   });
      // },
    },
  ]);

  render(<RemixStub />);

  expect(await screen.findByTestId("title")).toHaveTextContent("Users");
});

// test("all routes have ids", () => {
//   function Home() {
//     let matches = useMatches();

//     return (
//       <div>
//         <h1>HOME</h1>
//         <pre data-testid="matches">{JSON.stringify(matches, null, 2)}</pre>
//       </div>
//     );
//   }

//   let RemixStub = unstable_createRemixStub([
//     {
//       element: (
//         <div>
//           <h1>ROOT</h1>
//           <Outlet />
//         </div>
//       ),
//       children: [
//         {
//           path: "/",
//           element: <Home />,
//         },
//       ],
//     },
//   ]);

//   render(<RemixStub />);

//   let matchesTextContent = screen.getByTestId("matches").textContent;
//   // eslint-disable-next-line jest-dom/prefer-in-document
//   expect(matchesTextContent).toBeDefined();
//   let matches = JSON.parse(matchesTextContent!);
//   let matchesWithoutIds = matches.filter((match: any) => match.id == null);

//   expect(matchesWithoutIds).toHaveLength(0);
// });
