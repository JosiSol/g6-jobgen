package router

import (
	controllers "jobgen-backend/Delivery/Controllers"
	infrastructure "jobgen-backend/Infrastructure"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func SetupRouter(
	userController *controllers.UserController,
	authController *controllers.AuthController,
	jobController *controllers.JobController,
	authMiddleware *infrastructure.AuthMiddleware,
	fileController *controllers.FileController,
	cvController *controllers.CVController,
	contactController *controllers.ContactController, // New: Contact Controller

) *gin.Engine {
	r := gin.Default()
	
	// todo change the cors policy later on
	// CORS setup - allow all origins, methods, headers (development)
	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true, // allow everything
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false, //  must be false when AllowAllOrigins = true
		MaxAge: 12 * time.Hour,
	}))



	// Swagger docs
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	api := r.Group("/api/v1")
	{
		// Public routes
		api.POST("/contact", contactController.SubmitContactForm) // New: Contact Form Submission

		auth := api.Group("/auth")
		{
			auth.POST("/register", userController.Register)
			auth.POST("/login", userController.Login)
			auth.POST("/verify-email", userController.VerifyEmail)
			auth.POST("/forgot-password", userController.RequestPasswordReset)
			auth.POST("/reset-password", userController.ResetPassword)
			auth.POST("/refresh", authController.RefreshToken)
			auth.POST("/logout", authMiddleware.RequireAuth(), authController.Logout)
			auth.POST("/resend-otp", userController.ResendOTP)
			auth.POST("/change-password", authMiddleware.RequireAuth(), userController.ChangePassword)
		}

		users := api.Group("/users")
		users.Use(authMiddleware.RequireAuth())
		{
			users.GET("/profile", userController.GetProfile)
			users.PUT("/profile", userController.UpdateProfile)
			users.DELETE("/account", userController.DeleteAccount)
		}

		// Job routes (public access for browsing)
		jobs := api.Group("/jobs")
		{
			jobs.GET("/", jobController.GetJobs)                            // Public job browsing
			jobs.GET("/:id", jobController.GetJobByID)                      // Public job details
			jobs.GET("/trending", jobController.GetTrendingJobs)            // Public trending jobs
			jobs.GET("/stats", jobController.GetJobStats)                   // Public job statistics
			jobs.GET("/sources", jobController.GetJobSources)               // Public job sources
			jobs.GET("/search-by-skills", jobController.SearchJobsBySkills) // Public skill-based search

			// Authenticated job routes (optional auth using OptionalAuth middleware)
			jobs.GET("/search", authMiddleware.OptionalAuth(), jobController.SearchJobs) // Enhanced with user context if authenticated

			// Authenticated-only job routes
			authenticated := jobs.Group("/")
			authenticated.Use(authMiddleware.RequireAuth())
			{
				authenticated.GET("/matched", jobController.GetMatchedJobs) // Personalized job matching
			}
		}

		admin := api.Group("/admin")
		admin.Use(authMiddleware.RequireAdmin())
		{
			admin.GET("/users", userController.GetUsers)
			admin.PUT("/users/:user_id/role", userController.UpdateUserRole)
			admin.PUT("/users/:user_id/toggle-status", userController.ToggleUserStatus)
			admin.DELETE("/users/:user_id", userController.DeleteUser)

			// Job management
			jobAdmin := admin.Group("/jobs")
			{
				jobAdmin.POST("/aggregate", jobController.TriggerJobAggregation) // Trigger job scraping
				jobAdmin.POST("/", jobController.CreateJob)                      // Create job
				jobAdmin.PUT("/:id", jobController.UpdateJob)                    // Update job
				jobAdmin.DELETE("/:id", jobController.DeleteJob)                 // Delete job
			}
		}

		files := api.Group("/files")
		files.Use(authMiddleware.RequireAuth())
		{
			files.GET("/:id", fileController.DownloadFile)
			files.GET("/profile-picture/:id", fileController.GetProfilePicture)
			files.GET("/profile-picture/me", fileController.GetMyProfilePicture)
			files.POST("/upload/profile", fileController.UploadProfile)
			files.POST("/upload/document", fileController.UploadDocument)
			files.DELETE("/:id", fileController.DeleteFile)
		}

		addCVRoutes(api, cvController, authMiddleware.RequireAuth())
	}

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"success": true,
			"message": "Service is healthy",
			"data": gin.H{
				"status":    "ok",
				"timestamp": time.Now().UTC(),
				"version":   "1.0.0",
			},
		})
	})

	return r
}

func addCVRoutes(router *gin.RouterGroup, cvController *controllers.CVController, authMiddleware gin.HandlerFunc) {
	cvRoutes := router.Group("/cv")
	cvRoutes.Use(authMiddleware)
	{
		cvRoutes.POST("/", cvController.StartParsingJobFromRef)
		cvRoutes.POST("/parse", cvController.StartParsingJobHandler)
		cvRoutes.GET("/parse/:jobId/status", cvController.GetParsingJobStatusHandler)
		cvRoutes.GET("/:id", cvController.GetParsingJobStatusHandler)
	}
}
