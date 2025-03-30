/**
 * @swagger
 * tags:
 *   name: PPTs
 *   description: PPT management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PPT:
 *       type: object
 *       required:
 *         - title
 *         - batch
 *         - filePath
 *         - fileName
 *         - uploadedBy
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         title:
 *           type: string
 *           description: PPT title
 *         description:
 *           type: string
 *           description: PPT description
 *         batch:
 *           type: string
 *           description: Batch ID
 *         filePath:
 *           type: string
 *           description: Path to the file
 *         fileName:
 *           type: string
 *           description: Original file name
 *         fileUrl:
 *           type: string
 *           description: URL to access the file
 *         uploadedBy:
 *           type: string
 *           description: User ID who uploaded
 *         viewCount:
 *           type: number
 *           description: Number of views
 *         downloadCount:
 *           type: number
 *           description: Number of downloads
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation date
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update date
 */

/**
 * @swagger
 * /api/ppts:
 *   get:
 *     summary: Get all PPTs
 *     tags: [PPTs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: batch
 *         schema:
 *           type: string
 *         description: Filter by batch ID
 *     responses:
 *       200:
 *         description: List of PPTs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PPT'
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 * 
 *   post:
 *     summary: Upload a new PPT
 *     tags: [PPTs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - batch
 *               - file
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               batch:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: PPT uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PPT'
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/ppts/{id}:
 *   get:
 *     summary: Get PPT by ID
 *     tags: [PPTs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: PPT ID
 *     responses:
 *       200:
 *         description: PPT data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PPT'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: PPT not found
 *       500:
 *         description: Server error
 * 
 *   put:
 *     summary: Update PPT
 *     tags: [PPTs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: PPT ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               batch:
 *                 type: string
 *     responses:
 *       200:
 *         description: PPT updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PPT'
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Not authorized
 *       404:
 *         description: PPT not found
 *       500:
 *         description: Server error
 * 
 *   delete:
 *     summary: Delete PPT
 *     tags: [PPTs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: PPT ID
 *     responses:
 *       200:
 *         description: PPT deleted successfully
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
 *                   example: "PPT deleted"
 *       401:
 *         description: Not authorized
 *       404:
 *         description: PPT not found
 *       500:
 *         description: Server error
 */
