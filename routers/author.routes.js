import express from "express";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authors
 *   description: API for managing Authors
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Author:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the author
 *         name:
 *           type: string
 *           description: The name of the author
 *         description:
 *           type: string
 *           description: A short bio of the author
 *         books:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of Book IDs written by the author
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: 64a1b2c3d4e5f6a7b8c9d0e2
 *         name: J.K. Rowling
 *         description: British author best known for the Harry Potter series.
 *         books:
 *           - 64a1b2c3d4e5f6a7b8c9d0e3
 *         createdAt: 2024-01-01T00:00:00.000Z
 *         updatedAt: 2024-01-01T00:00:00.000Z
 */

/**
 * @swagger
 * /authors:
 *   get:
 *     summary: Get all authors
 *     tags: [Authors]
 *     responses:
 *       200:
 *         description: Successfully retrieved all authors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Authors fetched successfully
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Author'
 *       500:
 *         description: Internal Server Error
 */
router.get("/", (req, res) => {
  res
    .status(200)
    .json({
      success: true,
      message: "Authors fetched successfully",
      payload: [],
    });
});

/**
 * @swagger
 * /authors:
 *   post:
 *     summary: Create a new author
 *     tags: [Authors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: J.K. Rowling
 *               description:
 *                 type: string
 *                 example: British author best known for the Harry Potter series.
 *     responses:
 *       201:
 *         description: Author created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Author created successfully
 *                 payload:
 *                   $ref: '#/components/schemas/Author'
 *       400:
 *         description: All fields are required
 *       500:
 *         description: Internal Server Error
 */
router.post("/", (req, res) => {
  res
    .status(201)
    .json({
      success: true,
      message: "Author created successfully",
      payload: {},
    });
});

/**
 * @swagger
 * /authors/{id}:
 *   get:
 *     summary: Get an author by ID
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The author ID
 *         example: 64a1b2c3d4e5f6a7b8c9d0e2
 *     responses:
 *       200:
 *         description: Author fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Author fetched successfully
 *                 payload:
 *                   $ref: '#/components/schemas/Author'
 *       404:
 *         description: Author not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/:id", (req, res) => {
  res
    .status(200)
    .json({
      success: true,
      message: "Author fetched successfully",
      payload: {},
    });
});

/**
 * @swagger
 * /authors/{id}:
 *   put:
 *     summary: Update an author by ID
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The author ID
 *         example: 64a1b2c3d4e5f6a7b8c9d0e2
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: J.K. Rowling
 *               description:
 *                 type: string
 *                 example: Updated author bio.
 *     responses:
 *       200:
 *         description: Author updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Author updated successfully
 *                 payload:
 *                   $ref: '#/components/schemas/Author'
 *       404:
 *         description: Author not found
 *       500:
 *         description: Internal Server Error
 */
router.put("/:id", (req, res) => {
  res
    .status(200)
    .json({
      success: true,
      message: "Author updated successfully",
      payload: {},
    });
});

/**
 * @swagger
 * /authors/{id}:
 *   delete:
 *     summary: Delete an author by ID
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The author ID
 *         example: 64a1b2c3d4e5f6a7b8c9d0e2
 *     responses:
 *       200:
 *         description: Author deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Author deleted successfully
 *       404:
 *         description: Author not found
 *       500:
 *         description: Internal Server Error
 */
router.delete("/:id", (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "Author deleted successfully" });
});

export default router;
