using DevTracker.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DevTracker.Api.Controllers;

[Route("api/comments")]
public class CommentsController : ApiControllerBase
{
    private readonly ICommentService _commentService;

    public CommentsController(ICommentService commentService)
    {
        _commentService = commentService;
    }

    [HttpDelete("{commentId:int}")]
    public async Task<IActionResult> Delete(int commentId)
    {
        await _commentService.DeleteAsync(commentId, CurrentUserId);
        return NoContent();
    }
}
