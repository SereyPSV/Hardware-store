const bcrypt = require("bcrypt");
const User = require("../models/User");
const { generate } = require("../helpers/token");
const ROLES = require("../constants/roles");
const ShoppingCart = require("../models/ShoppingCart");

// ------register------
async function register(login, password) {
  if (!password) {
    throw new Error("Password is empty");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({ login, password: passwordHash });
  const token = generate({ id: user.id });

  await user.populate({
    path: "shoppingCart",
    populate: "product",
  });

  return { user, token };
}

// ------login------
async function login(login, password) {
  const user = await User.findOne({ login });

  if (!user) {
    throw new Error("User not found");
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new Error("Wrong password");
  }

  const token = generate({ id: user.id });

  return { token, user };
}

function getUsers() {
  return User.find();
}

function getUser(id) {
  return User.findById(id).populate({
    path: "shoppingCart",
    populate: "product",
  });
}

function getRoles() {
  return [
    { id: ROLES.ADMIN, name: "Администратор" },
    { id: ROLES.SELLER, name: "Продавец" },
    { id: ROLES.BUYER, name: "Покупатель" },
  ];
}

// delete
function deleteUser(id) {
  return User.deleteOne({ _id: id });
}

// edit (roles)
function updateUser(id, userData) {
  return User.findByIdAndUpdate(id, userData, { returnDocument: "after" });
}

module.exports = {
  register,
  login,
  getUser,
  getUsers,
  getRoles,
  deleteUser,
  updateUser,
};
