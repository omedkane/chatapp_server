// import { Document, Model, model, Schema } from "mongoose";

// export interface ITest {
//   a: string;
//   b: string;
// }

// export interface ITestDoc extends ITest, Document {
//   getComplete: () => string;
// }

// interface IMethods {
//   getComplete: () => any;
// }

// const testSchema = new Schema<
//   ITest,
//   Model<ITestDoc, {}, IMethods, {}>,
//   IMethods
// >({
//   a: "987",
//   b: "97897654",
// });

// testSchema.methods.getComplete = function (this: ITestDoc) {
//   console.log(this.a);
// };

// const TestModel = model<ITestDoc, Model<ITestDoc, {}, IMethods, {}>, undefined>(
//   "testset",
//   testSchema as any,
//   undefined,
//   {
//     overwriteModels: true,
//   }
// );

// function testMe() {
//   const popo = new TestModel({
//     a: "321",
//     b: "123",
//   });
//   //   popo.get
// }
// // enum

export default null;
