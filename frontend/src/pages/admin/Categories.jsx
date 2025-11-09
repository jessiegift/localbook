import { useState, useEffect } from "react";
import api from "../../services/api";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [newCategory, setNewCategory] = useState({
    name: "",
    icon: "",
    description: "",
    color: "#3B82F6",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Mock data
      setCategories([
        { id: 1, name: "Hair Salons", icon: "💇", description: "Professional hair services", color: "#3B82F6", businessCount: 45 },
        { id: 2, name: "Spa & Wellness", icon: "💆", description: "Relaxation and wellness", color: "#10B981", businessCount: 28 },
        { id: 3, name: "Barber Shops", icon: "✂️", description: "Men's grooming", color: "#8B5CF6", businessCount: 12 },
      ]);
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post("/categories", newCategory);
      setMessage("✅ Category added successfully");
      fetchCategories();
      setShowAddModal(false);
      setNewCategory({ name: "", icon: "", description: "", color: "#3B82F6" });
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error adding category:", error);
      setMessage("❌ Failed to add category");
    }
  };

  const handleUpdateCategory = async (id) => {
    try {
      await api.put(`/categories/${id}`, editingCategory);
      setMessage("✅ Category updated successfully");
      fetchCategories();
      setEditingCategory(null);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error updating category:", error);
      setMessage("❌ Failed to update category");
    }
  };

  const handleDeleteCategory = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?\nAll businesses in this category will need to be reassigned."
    );
    if (!confirmed) return;

    try {
      await api.delete(`/categories/${id}`);
      setMessage("✅ Category deleted successfully");
      fetchCategories();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting category:", error);
      setMessage("❌ Failed to delete category");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Categories Management</h1>
          <p className="text-gray-600 mt-2">
            Manage business categories on the platform
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold flex items-center gap-2"
        >
          ➕ Add Category
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.includes("✅")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 mb-1">Total Categories</p>
          <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">Total Businesses</p>
          <p className="text-3xl font-bold text-gray-900">
            {categories.reduce((sum, cat) => sum + (cat.businessCount || 0), 0)}
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
            style={{ borderLeft: `4px solid ${category.color}` }}
          >
            {editingCategory?.id === category.id ? (
              /* Edit Mode */
              <div>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, name: e.target.value })
                  }
                  className="w-full mb-2 px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  value={editingCategory.icon}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, icon: e.target.value })
                  }
                  placeholder="Icon emoji"
                  className="w-full mb-2 px-3 py-2 border rounded-lg"
                />
                <textarea
                  value={editingCategory.description}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      description: e.target.value,
                    })
                  }
                  className="w-full mb-2 px-3 py-2 border rounded-lg"
                  rows="2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateCategory(category.id)}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{category.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600">{category.businessCount} businesses</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 text-sm">{category.description}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="bg-red-600 text-white p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold">Add New Category</h2>
            </div>

            <form onSubmit={handleAddCategory} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon (Emoji) *
                  </label>
                  <input
                    type="text"
                    value={newCategory.icon}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, icon: e.target.value })
                    }
                    placeholder="💇"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newCategory.description}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, color: e.target.value })
                    }
                    className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                >
                  Add Category
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;