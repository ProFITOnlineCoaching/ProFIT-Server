import {Schema,model}from "mongoose"


const foodSchema = new Schema({
    name:{
        type:String,
        required:[true,"Food Name is required"]
    },
    image:{
        type:String,
        required:[true,"Food Image is required"]
    },
    quantity:{
        type:Number,
        required:[true,"Food quantity is required"]
    },
    macros: {
        calories: { type: Number, min: 0 },
        proteins: { type: Number, min: 0 },
        fats: { type: Number, min: 0 },
        carbs: { type: Number, min: 0 }
    },
    baseMacro: {
        mainProtein: String,
        mainFats: String,
        mainCarbs: String,
        subProtein: String,
        subFats: String,
        subCarbs: String
      },
      servingUnit:{
        type: String,
        enum:['Gram','Scoop','Piece','Mili','Spoon','Cup'],
        default:'Gram'
      },
      category: {
        type: String,
        enum: ['Desserts', 'Vegetables', 'Fruits', 'Bakeries', 'Spices', 'Seafood', 'Juices', 'Meat', 'Oils', 'Nuts', 'Chicken', 'Supplements', 'Egg', 'Milk Product', 'Sauces'],
      },
      foodAllergens: {
        type: [String],
        enum: [
          'Milk', 'Eggs', 'Fish', 'Shellfish', 
          'Tree Nuts', 'Peanuts', 'Wheat', 'Soybeans',
          'Corn', 'Gelatin', 'Beef', 'Chicken', 'Mutton',
          'Sesame', 'Sunflower', 'Poppy', 'Citrus',
          'Strawberries', 'Bananas', 'Garlic', 'Onions',
          'Coriander', 'Mustard', 'Oats', 'Rye'
        ]
      },
      diseaseCompatibility: {
        type: [String],
        enum: ['Diabetes', 'Hypertension', 'Pregnancy', 'Insulin Resistance', 'Autoimmune Disease And Inflammation', 'Pcos', 'Familial Mediterranean Fever', 'Gastric Sleeve', 'Kidney Disease', 'Hepatic Patient', 'High Cholesterol', 'Gout', 'Lactose Intolerance', 'Favism', 'Hypothyroidism', 'Hyperthyroidism']
      }

},{
    timestamps:true
})

export const foodModel = model('food',foodSchema)