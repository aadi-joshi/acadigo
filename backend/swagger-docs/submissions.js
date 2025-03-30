/**
 * @swagger
 * tags:
 *   name: Submissions
 *   description: Submission management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Submission:
 *       type: object
 *       required:
 *         - assignment
 *         - student
 *         - files
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         assignment:
 *           type: string
 *           description: Assignment ID
 *         student:
 *           type: string
 *           description: Student ID
 *         files:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               filePath:
 *                 type: string
 *               fileName:
 *                 type: string
 *               fileUrl:
 *                 type: string
 *         notes:
 *           type: string
 *           description: Student notes for submission
 *         status:
 *           type: string
 *           enum: [submitted, late, graded]
 *           description: Submission status
 *         score:
 *           type: number
 *           description: Score given by trainer
 *         feedback:
 *           type: string
 *           description: Feedback from trainer
 *         submittedAt:
 *           type: string
 *           format: date-time
 *         gradedBy:
 *           type: string
 *           description: Trainer ID who graded
 *         gradedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/submissions/my-submissions:
 *   get:
 *     summary: Get my submissions (for students)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of student's submissions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Submission'
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/submissions/{id}/grade:
 *   put:
 *     summary: Grade a submission
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Submission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - score
 *             properties:
 *               score:
 *                 type: number
 *                 description: Score to assign
 *               feedback:
 *                 type: string
 *                 description: Feedback for the student
 *     responses:
 *       200:
 *         description: Submission graded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Submission'
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Submission not found
 *       500:
 *         description: Server error
 */
